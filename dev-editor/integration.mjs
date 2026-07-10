// 页内编辑器（仅本地预览模式）
// 通过 astro:config:setup 的 command 判断实现硬隔离：
// 只有 `astro dev` 会挂载本集成；`astro build` 时这里直接 return，
// 正式产物 _book/ 中不含任何编辑按钮、脚本或接口。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export default function devEditor() {
  return {
    name: 'dev-editor',
    hooks: {
      'astro:config:setup': ({ command, config, injectScript, updateConfig }) => {
        if (command !== 'dev') return;
        const docsDir = fileURLToPath(new URL('./src/content/docs', config.root));
        const publicDir = fileURLToPath(config.publicDir);
        injectScript('page', fs.readFileSync(path.join(here, 'client.js'), 'utf8'));
        updateConfig({ vite: { plugins: [apiPlugin(docsDir, publicDir)] } });
      },
    },
  };
}

// 本地接口（挂在 vite dev server 上，构建时不存在）：
//   GET  /__dev-editor/load?pathname=/2d/xxx/         → { file, content }
//   POST /__dev-editor/save { file, content }         → { ok: true }
//   POST /__dev-editor/upload { file, name, data }    → { url }  图片存到 public/<文档目录>/img/
//   POST /__dev-editor/preview { content }            → { html } 渲染但不写盘（实时预览）
// 编辑器刚保存过的文件（绝对路径 → 时间戳）：3 秒内拦下它触发的整页刷新。
// 页面上的实时预览已经就是保存的内容，再刷新只会白闪一下。
// 外部编辑器（VS Code 等）的改动不在此列，仍正常热更新。
// 本会话（dev server 本次运行）内经编辑器上传的图片：文档绝对路径 → Set<文件名>。
// 保存时对照正文引用做垃圾回收——被撤回/删掉引用的上传图连文件一起删。
// 刻意不碰会话外的历史图片：没有版本控制，误删无法恢复。
const sessionUploads = new Map();

// 换图备份：文档绝对路径 → Map<图片名, 原始字节>。只存第一次替换前的原图（多次换图仍可回到最初）。
// 保存 = 提交（清空备份）；「还原原图」或不保存关闭 = 写回备份。
const replaceBackups = new Map();

const recentSaves = new Map();
function recentSaveActive() {
  const now = Date.now();
  for (const [k, t] of recentSaves) if (now - t > 3000) recentSaves.delete(k);
  return recentSaves.size > 0;
}

function apiPlugin(docsDir, publicDir) {
  return {
    name: 'dev-editor-api',
    configureServer(server) {
      // Astro 内容层的整页刷新不经过 handleHotUpdate，只能在 WebSocket 通道上拦：
      // 编辑器保存后的 3 秒窗口内丢弃 full-reload —— 页面上的实时预览已是保存的内容，刷新纯属白闪。
      const chans = new Set([server.hot, server.ws, server.environments?.client?.hot].filter(Boolean));
      for (const ch of chans) {
        const orig = ch.send.bind(ch);
        ch.send = (payload, ...rest) => {
          if (payload && typeof payload === 'object' && payload.type === 'full-reload' && recentSaveActive()) return;
          return orig(payload, ...rest);
        };
      }
      server.middlewares.use('/__dev-editor', (req, res) => {
        handle(req, res, docsDir, publicDir).catch((err) => {
          send(res, 500, { error: String(err) });
        });
      });
    },
  };
}

async function handle(req, res, docsDir, publicDir) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/load') {
    const file = resolveDocFile(docsDir, url.searchParams.get('pathname') || '/');
    if (!file) return send(res, 404, { error: 'not a markdown page' });
    return send(res, 200, {
      file: path.relative(docsDir, file).split(path.sep).join('/'),
      content: fs.readFileSync(file, 'utf8'),
    });
  }
  if (req.method === 'POST' && url.pathname === '/preview') {
    const body = JSON.parse(await readBody(req));
    if (typeof body.content !== 'string') return send(res, 400, { error: 'invalid content' });
    return send(res, 200, { html: await renderPreview(body.content) });
  }
  if (req.method === 'POST' && url.pathname === '/upload') {
    const body = JSON.parse(await readBody(req));
    // 由当前编辑的文档推导图片目录：docs/2D/dom/index.md → public/2D/dom/img/
    const docAbs = path.resolve(docsDir, body.file || '');
    if (!docAbs.startsWith(docsDir + path.sep) || !fs.existsSync(docAbs)) {
      return send(res, 400, { error: 'invalid file' });
    }
    const name = String(body.name || '');
    const extM = name.match(/\.(png|jpe?g|gif|webp)$/i);
    if (!extM) return send(res, 400, { error: 'invalid image name' });
    if (typeof body.data !== 'string') return send(res, 400, { error: 'invalid data' });
    const ext = extM[0].toLowerCase();
    const relDir = path.relative(docsDir, path.dirname(docAbs)).split(path.sep).join('/');
    const imgDir = path.join(publicDir, relDir, 'img');
    fs.mkdirSync(imgDir, { recursive: true });
    // 序号按【文档内容】定，不按目录定：目录里没被文档引用的孤儿文件（粘贴后撤销留下的）
    // 允许被覆盖，所以「粘贴→撤销→再粘贴」得到同一个号，序号不会白白上涨。
    // 规范名 = 每段 1–3 位数字（文档惯例 1.png / 3-1.png）；时间戳、哈希等大数字按乱名重编。
    const CONV = /^\d{1,3}(-\d{1,3})*\.(png|jpe?g|gif|webp)$/i;
    const content = typeof body.content === 'string' ? body.content : '';
    const caret = Number.isFinite(body.caret) ? body.caret : content.length;
    const prefix = '/' + (relDir ? relDir + '/' : '') + 'img/';
    const refRe = new RegExp(
      prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d{1,3}(?:-\\d{1,3})*\\.(?:png|jpe?g|gif|webp))', 'gi');
    const refs = [];
    for (let m; (m = refRe.exec(content)); ) refs.push({ name: m[1].toLowerCase(), idx: m.index });
    // 换图模式：客户端检测到选区是一条图片引用时传来 replaceUrl → 沿用原名原地覆盖，
    // 不产生新序号、不进会话回收名单（历史图刻意不追踪）
    const replaceUrl = typeof body.replaceUrl === 'string' ? body.replaceUrl : '';
    if (replaceUrl.toLowerCase().startsWith(prefix.toLowerCase())) {
      const rname = replaceUrl.slice(prefix.length);
      if (/^[\w.-]+\.(png|jpe?g|gif|webp)$/i.test(rname)) {
        const target = path.join(imgDir, rname);
        // 备份原图（只存最初版本），供「还原原图」和不保存关闭时回滚
        if (fs.existsSync(target)) {
          if (!replaceBackups.has(docAbs)) replaceBackups.set(docAbs, new Map());
          const bak = replaceBackups.get(docAbs);
          if (!bak.has(rname)) bak.set(rname, fs.readFileSync(target));
        }
        fs.writeFileSync(target, Buffer.from(body.data, 'base64'));
        return send(res, 200, { url: prefix + rname, replaced: true });
      }
    }
    const refSet = new Set(refs.map((r) => r.name));
    const firstSeg = (n) => Number(n.match(/^(\d+)/)[1]);
    let final;
    if (CONV.test(name)) {
      final = name;
    } else {
      // 光标之前最后一张被引用图的号 +1；已被文档用掉的号跳过
      const used = new Set(refs.map((r) => firstSeg(r.name)));
      let n = refs.filter((r) => r.idx < caret).reduce((a, r) => Math.max(a, firstSeg(r.name)), 0) + 1;
      while (used.has(n)) n++;
      final = n + ext;
    }
    // 只避让【文档里正引用着】的名字；目录里未被引用的同名文件直接覆盖（孤儿回收）
    const base = final.replace(/\.\w+$/, '');
    for (let n = 1; refSet.has(final.toLowerCase()); n++) final = `${base}-${n}${ext}`;
    fs.writeFileSync(path.join(imgDir, final), Buffer.from(body.data, 'base64'));
    if (!sessionUploads.has(docAbs)) sessionUploads.set(docAbs, new Set());
    sessionUploads.get(docAbs).add(final);
    return send(res, 200, { url: prefix + final });
  }
  if (req.method === 'POST' && (url.pathname === '/restore' || url.pathname === '/discard')) {
    const body = JSON.parse(await readBody(req));
    const docAbs = path.resolve(docsDir, body.file || '');
    if (!docAbs.startsWith(docsDir + path.sep) || !fs.existsSync(docAbs)) {
      return send(res, 400, { error: 'invalid file' });
    }
    const relDir = path.relative(docsDir, path.dirname(docAbs)).split(path.sep).join('/');
    const imgDir = path.join(publicDir, relDir, 'img');
    const bak = replaceBackups.get(docAbs);
    if (url.pathname === '/restore') {
      // 手动「还原原图」：写回单张备份
      const name = String(body.name || '');
      if (!bak || !bak.has(name)) return send(res, 404, { error: 'no backup' });
      fs.writeFileSync(path.join(imgDir, name), bak.get(name));
      bak.delete(name);
      return send(res, 200, { ok: true });
    }
    // /discard：不保存关闭 —— 还原所有被换的图，并删掉本会话上传且磁盘正文未引用的图
    const restored = [];
    if (bak) {
      for (const [name, buf] of bak) {
        try { fs.writeFileSync(path.join(imgDir, name), buf); restored.push(name); } catch {}
      }
      replaceBackups.delete(docAbs);
    }
    const removed = [];
    const uploads = sessionUploads.get(docAbs);
    if (uploads) {
      const diskContent = fs.readFileSync(docAbs, 'utf8');
      const prefix = '/' + (relDir ? relDir + '/' : '') + 'img/';
      for (const name of [...uploads]) {
        if (diskContent.includes(prefix + name)) continue;
        try { fs.unlinkSync(path.join(imgDir, name)); } catch {}
        uploads.delete(name);
        removed.push(name);
      }
    }
    return send(res, 200, { ok: true, restored, removed });
  }
  if (req.method === 'POST' && url.pathname === '/save') {
    const body = JSON.parse(await readBody(req));
    const abs = path.resolve(docsDir, body.file || '');
    // 路径必须落在 docs 目录内、必须是已存在的 md/mdx —— 只允许改现有文档
    if (!abs.startsWith(docsDir + path.sep) || !/\.(md|mdx)$/i.test(abs) || !fs.existsSync(abs)) {
      return send(res, 400, { error: 'invalid file' });
    }
    if (typeof body.content !== 'string') return send(res, 400, { error: 'invalid content' });
    recentSaves.set(abs.split(path.sep).join('/'), Date.now());
    fs.writeFileSync(abs, body.content, 'utf8');
    replaceBackups.delete(abs); // 保存 = 提交换图，原图备份不再保留
    // 垃圾回收：本会话上传、但保存的正文里已不再引用的图片（撤回/删掉了引用），连文件一起删
    const removed = [];
    const uploads = sessionUploads.get(abs);
    if (uploads) {
      const relDir = path.relative(docsDir, path.dirname(abs)).split(path.sep).join('/');
      const prefix = '/' + (relDir ? relDir + '/' : '') + 'img/';
      for (const name of [...uploads]) {
        if (body.content.includes(prefix + name)) continue;
        try { fs.unlinkSync(path.join(publicDir, relDir, 'img', name)); } catch {}
        uploads.delete(name);
        removed.push(name);
      }
    }
    return send(res, 200, { ok: true, removedImages: removed });
  }
  send(res, 404, { error: 'unknown endpoint' });
}

// URL → 源文件：逐段大小写不敏感匹配（Astro slug 会把 2DGame 变成 2dgame）
function resolveDocFile(docsDir, pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return null; }
  const segs = p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  let dir = docsDir;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i].toLowerCase();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
    const d = entries.find((e) => e.isDirectory() && e.name.toLowerCase() === seg);
    if (d) { dir = path.join(dir, d.name); continue; }
    if (i === segs.length - 1) {
      const f = entries.find((e) => e.isFile() &&
        /\.(md|mdx)$/i.test(e.name) && e.name.replace(/\.(md|mdx)$/i, '').toLowerCase() === seg);
      if (f) return path.join(dir, f.name);
    }
    return null;
  }
  for (const name of ['index.md', 'index.mdx']) {
    const cand = path.join(dir, name);
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

// ---------- 实时预览渲染（不写盘） ----------
// 用 Astro 自带的 markdown 管线渲染；Starlight 的 :::提示块 手工转成同样的 aside 结构。
// 代码块高亮用 shiki（正式渲染是 expressive-code，主题略有差异）；保存后即为最终效果。
let procPromise = null;
function getProcessor() {
  // 本模块由 Astro 的配置加载器执行，其模块加载器在配置载入后即关闭，
  // 直接 import() 会报 "Vite module runner has been closed"。
  // 用 Function 构造的原生 import 绕开加载器，按绝对路径加载包入口。
  procPromise ??= (async () => {
    const nativeImport = new Function('p', 'return import(p)');
    const { pathToFileURL } = await nativeImport('node:url');
    const entry = pathToFileURL(
      path.join(here, '..', 'node_modules', '@astrojs', 'markdown-remark', 'dist', 'index.js')
    ).href;
    const m = await nativeImport(entry);
    return m.createMarkdownProcessor({ syntaxHighlight: 'shiki', shikiConfig: { theme: 'github-dark' } });
  })();
  return procPromise;
}

const ASIDE_LABEL = { note: '注意', tip: '提示', caution: '警告', danger: '危险' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function renderPreview(content) {
  const proc = await getProcessor();
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  // 按顶层 :::type[标题] … ::: 切段，提示块内层 markdown 单独渲染后包壳
  const lines = body.split('\n');
  const segs = []; // { aside?: {type,title}, md }
  let cur = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^:::(note|tip|caution|danger)(?:\[(.*?)\])?\s*$/);
    if (m) {
      if (cur.length) segs.push({ md: cur.join('\n') });
      cur = [];
      const inner = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) inner.push(lines[i++]);
      segs.push({ aside: { type: m[1], title: m[2] || ASIDE_LABEL[m[1]] }, md: inner.join('\n') });
    } else cur.push(lines[i]);
  }
  if (cur.length) segs.push({ md: cur.join('\n') });

  let html = '';
  for (const seg of segs) {
    const rendered = (await proc.render(seg.md)).code;
    if (seg.aside) {
      html += `<aside aria-label="${esc(seg.aside.title)}" class="starlight-aside starlight-aside--${seg.aside.type}">` +
        `<p class="starlight-aside__title" aria-hidden="true">${esc(seg.aside.title)}</p>` +
        `<div class="starlight-aside__content">${rendered}</div></aside>`;
    } else html += rendered;
  }
  return html;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

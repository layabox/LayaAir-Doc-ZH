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
      'astro:config:setup': ({ command, config, injectScript, updateConfig, addWatchFile }) => {
        if (command !== 'dev') return;
        const docsDir = fileURLToPath(new URL('./src/content/docs', config.root));
        const publicDir = fileURLToPath(config.publicDir);
        const sidebarFile = fileURLToPath(new URL('./src/sidebar.generated.json', config.root));
        // 侧栏 JSON 是 astro.config 启动时 import 的——加入配置监视,
        // 编辑器保存目录后 dev server 自动重启,新目录立即生效
        addWatchFile(sidebarFile);
        injectScript('page', fs.readFileSync(path.join(here, 'client.js'), 'utf8'));
        updateConfig({ vite: { plugins: [apiPlugin(docsDir, publicDir, sidebarFile)] } });
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

function apiPlugin(docsDir, publicDir, sidebarFile) {
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
        handle(req, res, docsDir, publicDir, sidebarFile).catch((err) => {
          send(res, 500, { error: String(err) });
        });
      });
    },
  };
}

async function handle(req, res, docsDir, publicDir, sidebarFile) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/sidebar') {
    // 目录(侧边栏) → 面板可编辑的缩进文本
    const items = JSON.parse(fs.readFileSync(sidebarFile, 'utf8'));
    return send(res, 200, { text: sidebarToText(items) });
  }
  if (req.method === 'POST' && url.pathname === '/sidebar') {
    const body = JSON.parse(await readBody(req));
    if (typeof body.text !== 'string') return send(res, 400, { error: 'invalid text' });
    const { items, warnings, missing } = parseSidebarText(body.text, docsDir);
    if (!items.length) return send(res, 400, { error: '目录不能为空' });
    // 目录里新增、但还没有对应文档的条目 → 自动生成骨架文档(frontmatter 齐全 + draft 占位),
    // 保存后点进页面用「编辑本页」直接写正文,新建文档全程不离开浏览器
    const created = createStubDocs(missing, docsDir, warnings);
    const count = (arr) => arr.reduce((n, it) => n + (it.items ? count(it.items) : 1), 0);
    send(res, 200, { ok: true, warnings, created, count: count(items) });
    // 先发响应再写盘:写入会触发 dev server 重启,先写会把这个响应打断
    setTimeout(() => {
      // 与现有文件格式保持一致(2 空格缩进、无尾部换行),内容不变时字节零差异
      fs.writeFileSync(sidebarFile, JSON.stringify(items, null, 2));
    }, 150);
    return;
  }
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

// URL → 源文件:逐段按 slug 规则匹配。文件/目录名要经过与 migrate.mjs 相同的 slug 化再比较——
// 不只是大小写(2DGame→2dgame),点号等特殊字符也会转连字符(2.x-Upgrade→2-x-upgrade)。
function slugifySeg(s) {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
}
function resolveDocFile(docsDir, pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return null; }
  const segs = p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  let dir = docsDir;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i].toLowerCase();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { entries = null; }
    if (entries) {
      const d = entries.find((e) => e.isDirectory() && slugifySeg(e.name) === seg);
      if (d) { dir = path.join(dir, d.name); continue; }
      if (i === segs.length - 1) {
        const f = entries.find((e) => e.isFile() &&
          /\.(md|mdx)$/i.test(e.name) && slugifySeg(e.name.replace(/\.(md|mdx)$/i, '')) === seg);
        if (f) return path.join(dir, f.name);
      }
    }
    // 逐段匹配失败 → 按 frontmatter 显式 slug 全量查找兜底(slug 与路径不同形的文档)
    return findBySlug(docsDir, segs.join('/').toLowerCase());
  }
  for (const name of ['index.md', 'index.mdx']) {
    const cand = path.join(dir, name);
    if (fs.existsSync(cand)) return cand;
  }
  return findBySlug(docsDir, segs.join('/').toLowerCase());
}

// frontmatter 显式 slug → 源文件的兜底索引;仅在逐段匹配失败时重建,3 秒内复用
let slugIndex = { at: 0, map: new Map() };
function findBySlug(docsDir, slug) {
  if (Date.now() - slugIndex.at > 3000) {
    const map = new Map();
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.mdx?$/i.test(e.name)) {
          const head = fs.readFileSync(p, 'utf8').slice(0, 2000);
          const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const m = fm && fm[1].match(/^slug:\s*"([^"]*)"/m);
          if (m) map.set(m[1].toLowerCase(), p);
        }
      }
    };
    try { walk(docsDir); } catch {}
    slugIndex = { at: Date.now(), map };
  }
  return slugIndex.map.get(slug) || null;
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

// ---------- 目录(侧边栏)编辑 ----------
// 面板里的文本格式:markdown 列表,缩进 2 空格为一层
//   - [条目名](/站点链接/)   ← 叶子(单篇文档)
//   - 分组名                 ← 无链接的行是分组,子项缩进写在下面
function sidebarToText(items) {
  const lines = [];
  const emit = (arr, depth) => {
    for (const it of arr) {
      const pad = '  '.repeat(depth);
      if (it.items) { lines.push(`${pad}- ${it.label}`); emit(it.items, depth + 1); }
      else lines.push(`${pad}- [${it.label}](${it.link})`);
    }
  };
  emit(items, 0);
  return lines.join('\n') + '\n';
}

// 全站文档的 slug 集合,供保存时校验目录链接。
// 与 Starlight 的规则一致:frontmatter 显式 slug 优先,否则按文件路径推导。
function collectDocSlugs(docsDir) {
  const slugs = new Set(['/']);
  const pathToSlug = (rel) => {
    let p = rel.replace(/\.mdx?$/i, '');
    const base = path.posix.basename(p);
    if (/^(index|readme)$/i.test(base)) p = path.posix.dirname(p);
    if (p === '.' || p === '') return '/';
    return '/' + p.split('/').map((seg) =>
      seg.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
    ).filter(Boolean).join('/') + '/';
  };
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.mdx?$/i.test(e.name)) {
        const head = fs.readFileSync(p, 'utf8').slice(0, 2000);
        const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        const slug = fm && fm[1].match(/^slug:\s*"([^"]*)"/m);
        const rel = path.relative(docsDir, p).split(path.sep).join('/');
        slugs.add(slug ? (slug[1] ? '/' + slug[1] + '/' : '/') : pathToSlug(rel));
      }
    }
  };
  walk(docsDir);
  return slugs;
}

function parseSidebarText(text, docsDir) {
  const warnings = [];
  const root = { items: [] };
  const stack = [{ depth: -1, node: root }];
  const rows = text.split(/\r?\n/);
  for (let ln = 0; ln < rows.length; ln++) {
    const raw = rows[ln];
    if (!raw.trim()) continue;
    const m = raw.match(/^(\s*)[*\-+]\s+(.*)$/);
    if (!m) { warnings.push(`第 ${ln + 1} 行不是「- 」列表项,已忽略`); continue; }
    const depth = Math.floor(m[1].replace(/\t/g, '  ').length / 2);
    const body = m[2].trim();
    if (!body) continue;
    const link = body.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
    let node;
    if (link) {
      // 站内链接自动规范化:小写、补尾部斜杠(带锚点或站外链接原样保留)
      let u = link[2].trim();
      if (u.startsWith('/') && !u.includes('#')) {
        u = u.toLowerCase();
        if (!u.endsWith('/')) u += '/';
      }
      node = { label: link[1].trim(), link: u };
    } else node = { label: body, collapsed: true, items: [] };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].node.items.push(node);
    stack.push({ depth, node });
  }
  // 去掉空分组(编辑到一半留下的)
  const prune = (arr) => arr.filter((it) => {
    if (!it.items) return true;
    it.items = prune(it.items);
    if (!it.items.length) { warnings.push(`空分组「${it.label}」已忽略`); return false; }
    return true;
  });
  const items = prune(root.items);
  // 找出站内链接没有对应文档的条目(交给 createStubDocs 自动建骨架或给出警告)
  const slugs = collectDocSlugs(docsDir);
  const missing = [];
  const check = (arr) => {
    for (const it of arr) {
      if (it.items) check(it.items);
      else if (it.link.startsWith('/') && !slugs.has(it.link.toLowerCase().replace(/#.*$/, ''))) {
        missing.push(it);
      }
    }
  };
  check(items);
  return { items, warnings, missing };
}

// 为目录里指向不存在文档的条目生成骨架文档:<slug>/index.md,
// frontmatter 按《AI出文档规范》(显式 slug、无 H1 正文),draft: true 保证正式构建不上线。
function createStubDocs(missing, docsDir, warnings) {
  const created = [];
  for (const it of missing) {
    if (it.link.includes('#')) {
      warnings.push(`「${it.label}」的链接 ${it.link} 带锚点且页面不存在,未自动创建,访问会 404`);
      continue;
    }
    const slug = it.link.replace(/^\/+|\/+$/g, '');
    // slug 规范:仅小写字母/数字/连字符/斜杠(与《AI出文档规范》一致,防 Linux 上线断链)
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(slug)) {
      warnings.push(`「${it.label}」的链接 ${it.link} 不符合 slug 规范(仅小写字母、数字、连字符),未自动创建,访问会 404`);
      continue;
    }
    const abs = path.join(docsDir, ...slug.split('/'), 'index.md');
    if (!abs.startsWith(docsDir + path.sep) || fs.existsSync(abs)) continue;
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, `---
title: ${JSON.stringify(it.label)}
slug: ${JSON.stringify(slug)}
draft: true
---

:::note[内容整理中]
本页由「编辑目录」自动创建。用右下角「编辑本页」撰写正文;完成后删除 frontmatter 中的 \`draft: true\` 一行(并按规范补上 \`description\`),即可在正式构建中上线。
:::
`);
    created.push(slug + '/index.md');
  }
  return created;
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

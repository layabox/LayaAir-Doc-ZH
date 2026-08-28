// LayaAir GitBook → Astro/Starlight 全量迁移脚本（v2：稳健 slug + 占位页）
// 用法：node migrate.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Users/1/desk/Laya/工作文档/LayaAir-Doc-ZH';
// ⚠️ 一次性迁移脚本,已完成使命,不要直接重跑:
//   1. DEST 指向旧位置(项目已搬到 Downloads/layaair_doc/htmldoc);
//   2. 重跑会覆盖迁移后的人工修改(draft 标记、占位页 noindex、单页修复等)。
//   如需对个别文件重做转换,参考本文件的转换函数单独复刻。
const DEST = 'C:/Users/1/desk/htmldoc';
const DOCS = path.posix.join(DEST, 'src/content/docs');
const PUBLIC = path.posix.join(DEST, 'public');

const IGNORE_DIRS = new Set(['.git', 'node_modules', '_book', '.vscode']);
const SKIP_ROOT = new Set(['SUMMARY.md', 'README.md', 'index.md', 'book.json']);
const MEDIA_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp',
  '.mp4', '.webm', '.mov', '.mp3', '.wav', '.json', '.zip', '.pdf',
  '.lh', '.ls', '.glb', '.gltf', '.fbx',
]);

const toPosix = (p) => p.split(path.sep).join('/');
const rel = (abs) => toPosix(path.relative(SRC, abs));

// 统一 slug 规则（小写、非字母数字转 -），链接与 frontmatter slug 共用，保证 Linux 上也一致
function slugify(p) {
  return p.split('/').map((seg) =>
    seg.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
  ).filter(Boolean).join('/');
}
// repo 相对 md → 站点 slug（readme→所在目录；根 index→空＝首页）
function mdToSlug(repoRelMd) {
  let p = repoRelMd.replace(/\.md$/i, '');
  const base = path.posix.basename(p);
  if (base.toLowerCase() === 'readme') p = path.posix.dirname(p);
  if (p === '.' || p === '' || p.toLowerCase() === 'index') return '';
  return slugify(p);
}
const slugToUrl = (s) => (s === '' ? '/' : '/' + s + '/');
// repo 相对 md → 输出 docs 文件路径（readme→index.md）
function mdToDocsPath(repoRelMd) {
  const dir = path.posix.dirname(repoRelMd);
  const base = path.posix.basename(repoRelMd);
  if (base.toLowerCase() === 'readme.md') return path.posix.join(dir === '.' ? '' : dir, 'index.md');
  return repoRelMd;
}

const produced = new Set(['']); // 已生成的 slug（''＝首页 index.mdx）
const referenced = new Set();   // 被引用到的 slug
const labelMap = {};            // slug → 标签（标题/占位页兜底）

// ---------- 收集文件 ----------
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.posix.join(toPosix(dir), name);
    const st = fs.statSync(full);
    if (st.isDirectory()) { if (!IGNORE_DIRS.has(name)) walk(full, out); }
    else out.push(full);
  }
  return out;
}
const allFiles = walk(SRC);

// ---------- 提示框转换 ----------
const ASIDE_MAP = { note: 'note', tip: 'tip', important: 'note', warning: 'caution', caution: 'danger', type: 'tip' };
function convertAsides(src) {
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^>\s*\[!(\w+)(?:\|([^\]]*))?\]\s*(.*)$/i);
    if (head) {
      const type = ASIDE_MAP[head[1].toLowerCase()] || 'note';
      let title = '';
      if (head[2]) { const lm = head[2].match(/label:\s*([^|]+)/i); if (lm) title = lm[1].trim().replace(/[:：]\s*$/, ''); }
      const body = [];
      if (head[3] && head[3].trim()) body.push(head[3].trim());
      let j = i + 1;
      while (j < lines.length && /^>/.test(lines[j])) { body.push(lines[j].replace(/^>\s?/, '')); j++; }
      out.push(title ? `:::${type}[${title}]` : `:::${type}`, ...body, ':::');
      i = j - 1;
    } else out.push(lines[i]);
  }
  return out.join('\n');
}

// ---------- 代码块语言规范化（大小写/别名） ----------
const LANG_ALIAS = { flow: 'typescript', typescript: 'typescript', javascript: 'javascript' };
function normalizeCodeLangs(src) {
  return src.replace(/^(\s*`{3,})([A-Za-z][\w-]*)/gm, (m, fence, lang) => {
    const l = lang.toLowerCase();
    return fence + (LANG_ALIAS[l] || l);
  });
}

// ---------- SEO：首段正文 → meta description ----------
// 跳过标题/import/JSX/提示框/列表/表格/空行，挑第一段散文，去掉 md 修饰，截到 ~155 字。
function extractDescription(body, max = 155) {
  for (const raw of body.split(/\r?\n/)) {
    const t = raw.trim();
    if (!t) continue;
    if (/^#{1,6}\s/.test(t) || /^import\s/.test(t) || /^[<:]/.test(t)) continue;
    if (/^[-*+]\s|^\d+\.\s|^>\s|^\||^[-=]{3,}$/.test(t)) continue;
    let s = t.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '').replace(/[`*_~]/g, '').replace(/\s+/g, ' ').trim();
    if (s.length < 10) continue;
    if (s.length > max) s = s.slice(0, max).replace(/[，。、,.\s][^，。、,.\s]*$/, '') + '…';
    return s;
  }
  return '';
}

// ---------- 链接/图片重写 ----------
function rewriteRefs(content, repoDir) {
  const resolve = (target) => {
    const clean = target.replace(/\\/g, '/');
    if (/^(https?:|mailto:|tel:|#)/i.test(clean)) return null;
    const hashIdx = clean.indexOf('#');
    const hash = hashIdx >= 0 ? clean.slice(hashIdx) : '';
    const noHash = hashIdx >= 0 ? clean.slice(0, hashIdx) : clean;
    if (!noHash) return null;
    const abs = noHash.startsWith('/')
      ? path.posix.normalize(noHash.slice(1))               // 站内绝对路径
      : path.posix.normalize(path.posix.join(repoDir, noHash)); // 相对路径
    if (/\.md$/i.test(abs)) {
      const s = mdToSlug(abs);
      referenced.add(s);
      return slugToUrl(s) + hash;
    }
    return '/' + abs + hash; // 资源 → public 绝对路径
  };
  content = content.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (m, bang, text, url, tail) => {
    const r = resolve(url); return r === null ? m : `${bang}[${text}](${r}${tail})`;
  });
  content = content.replace(/\bsrc=(["'])([^"']+)\1/g, (m, q, url) => {
    const r = resolve(url); return r === null ? m : `src=${q}${r}${q}`;
  });
  return content;
}

// ---------- 解析 SUMMARY → 侧栏 ----------
function parseSummary() {
  const txt = fs.readFileSync(path.posix.join(SRC, 'SUMMARY.md'), 'utf8');
  const root = { items: [] };
  const stack = [{ depth: -1, node: root }];
  for (const raw of txt.split(/\r?\n/)) {
    const m = raw.match(/^(\s*)[*\-+]\s+(.*)$/);
    if (!m) continue;
    const depth = Math.floor(m[1].replace(/\t/g, '  ').length / 2);
    const body = m[2].trim();
    if (!body) continue;
    const link = body.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
    let label, url = null;
    if (link) {
      label = link[1].trim();
      let target = link[2].trim().replace(/\\/g, '/').replace(/#.*$/, '');
      if (/\.md/i.test(target)) {
        const s = mdToSlug(target);
        referenced.add(s); labelMap[s] = label;
        url = slugToUrl(s);
      } else url = target;
    } else label = body.replace(/^[-\s]+/, '').trim();
    const node = url ? { label, link: url } : { label, items: [], collapsed: true };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    (stack[stack.length - 1].node.items ||= []).push(node);
    stack.push({ depth, node });
  }
  return root.items;
}
function normalizeSidebar(items) {
  return items.map((it) => {
    if (it.items && it.items.length) {
      const kids = normalizeSidebar(it.items);
      if (it.link) kids.unshift({ label: '概述', link: it.link });
      return { label: it.label, collapsed: true, items: kids };
    }
    if (it.items && it.link) return { label: it.label, link: it.link };
    if (it.items) return null;
    return it;
  }).filter(Boolean);
}

// ---------- 先解析 SUMMARY（填充 referenced / labelMap，供占位页与标题兜底） ----------
const sidebarRaw = parseSummary();

// ---------- 主流程 ----------
let mdCount = 0, mediaCount = 0;
for (const full of allFiles) {
  const r = rel(full);
  const ext = path.posix.extname(r).toLowerCase();
  const base = path.posix.basename(r);
  if (ext === '.md') {
    if (SKIP_ROOT.has(base) && path.posix.dirname(r) === '.') continue;
    let content = fs.readFileSync(full, 'utf8');
    const repoDir = path.posix.dirname(r);
    let title = '';
    const h1 = content.match(/^\s*#\s+(.+?)\s*$/m);
    if (h1) { title = h1[1].trim(); content = content.replace(h1[0], ''); }
    const slug = mdToSlug(r);
    if (!title) title = labelMap[slug] || base.replace(/\.md$/i, '');
    title = title.replace(/[`*_]/g, '').trim();
    content = rewriteRefs(convertAsides(normalizeCodeLangs(content)), repoDir);
    // SEO：从首段正文抽取 meta description（Starlight 据此生成 <meta name="description"> / og）
    const desc = extractDescription(content);
    const descLine = desc ? `description: ${JSON.stringify(desc)}\n` : '';
    const fm = `---\ntitle: ${JSON.stringify(title)}\n${descLine}slug: ${JSON.stringify(slug)}\n---\n\n`;
    const outAbs = path.posix.join(DOCS, mdToDocsPath(r));
    fs.mkdirSync(path.posix.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, fm + content.replace(/^\n+/, ''));
    produced.add(slug); mdCount++;
  } else if (MEDIA_EXT.has(ext)) {
    const outAbs = path.posix.join(PUBLIC, r);
    fs.mkdirSync(path.posix.dirname(outAbs), { recursive: true });
    fs.copyFileSync(full, outAbs); mediaCount++;
  }
}

// ---------- 为「被引用但源缺失」的页面生成占位页 ----------
let stubCount = 0;
fs.mkdirSync(path.posix.join(DOCS, '_stubs'), { recursive: true });
for (const s of referenced) {
  if (s === '' || produced.has(s)) continue;
  const title = labelMap[s] || s.split('/').pop();
  // 占位页不进搜索（pagefind:false）+ 不被搜索引擎收录（noindex），避免空页污染搜索与 SEO
  const fm = `---\ntitle: ${JSON.stringify(title)}\nslug: ${JSON.stringify(s)}\npagefind: false\nhead:\n  - tag: meta\n    attrs:\n      name: robots\n      content: noindex\n---\n\n`;
  const body = `:::note[内容整理中]\n本章节在原文档目录中已规划，但正文尚未提供。内容补充后会自动替换此占位页。\n:::\n`;
  fs.writeFileSync(path.posix.join(DOCS, '_stubs', s.replace(/\//g, '__') + '.md'), fm + body);
  produced.add(s); stubCount++;
}

// ---------- 侧栏落盘 ----------
const sidebar = normalizeSidebar(sidebarRaw);
// 修正首页链接（SUMMARY 的「文档首页」指向根 index → /）
const fixHome = (items) => items.map((it) => {
  if (it.items) return { ...it, items: fixHome(it.items) };
  if (it.link === slugToUrl('')) return { ...it, link: '/' };
  return it;
});
const finalSidebar = fixHome(sidebar);
// VFX Graph 教学文档集（路线 B 新增页，源自 LayaVFXSample/docs/vfx-graph，手写非迁移）
// 作为「VFX粒子插件」挂到「IDE插件 → 官方插件」子分组下，与 LOD/骨骼烘焙插件并列。
const vfxPluginGroup = {
  label: 'VFX粒子插件', collapsed: true, items: [
    { label: '教学文档集 · 总览', link: '/vfx-graph/' },
    { label: '概念篇', link: '/vfx-graph/concepts/' },
    { label: 'IDE 操作流程', link: '/vfx-graph/ide-workflow/' },
    { label: '属性详解 · Context', link: '/vfx-graph/context/' },
    { label: '属性详解 · Block', link: '/vfx-graph/block/' },
    { label: '属性详解 · 图级与组件', link: '/vfx-graph/graph-and-components/' },
    { label: '代码篇', link: '/vfx-graph/code/' },
    { label: '属性详解 · Operator', link: '/vfx-graph/operator/' },
    { label: '示例验证索引', link: '/vfx-graph/examples/' },
  ],
};
const findGroupByLabel = (items, label) => {
  for (const it of items || []) {
    if (it.label === label && it.items) return it;
    if (it.items) { const r = findGroupByLabel(it.items, label); if (r) return r; }
  }
  return null;
};
// Unity 导出插件详解文档集（路线 B 新增页，源自 untiydoc/docs，手写非迁移）
// 把 SUMMARY 生成的「Unity资源导出插件」单链接升级为分组：官方介绍页 + 详解各页。
const unityPluginItems = [
  { label: '插件介绍与导入', link: '/3d/advanced/unity/' },
  { label: '导出能力一览', link: '/unity-plugin/' },
  { label: '安装与导出窗口', link: '/unity-plugin/install/' },
  { label: '整体导出流程', link: '/unity-plugin/overview/' },
  { label: '网格导出', link: '/unity-plugin/mesh/' },
  { label: '材质与Shader导出', link: '/unity-plugin/material-shader/' },
  { label: '自定义Shader导出', link: '/unity-plugin/custom-shader/' },
  { label: '粒子系统导出', link: '/unity-plugin/particle/' },
  { label: '动画导出', link: '/unity-plugin/animation/' },
  { label: '2D精灵导出', link: '/unity-plugin/sprite-2d/' },
  { label: '疑似问题清单', link: '/unity-plugin/known-issues/' },
];
const upgradeUnityPluginEntry = (items) => {
  for (let i = 0; i < (items || []).length; i++) {
    const it = items[i];
    if (it.label === 'Unity资源导出插件' && it.link) {
      items[i] = { label: 'Unity资源导出插件', collapsed: true, items: unityPluginItems };
      return true;
    }
    if (it.items && upgradeUnityPluginEntry(it.items)) return true;
  }
  return false;
};
if (!upgradeUnityPluginEntry(finalSidebar)) {
  // 兜底：SUMMARY 里找不到该条目时退回顶层，避免文档丢失
  finalSidebar.push({ label: 'Unity资源导出插件', collapsed: true, items: unityPluginItems });
}
const officialPlugins = findGroupByLabel(finalSidebar, '官方插件');
if (officialPlugins) {
  officialPlugins.items = officialPlugins.items.filter((it) => it.label !== 'VFX粒子插件');
  officialPlugins.items.push(vfxPluginGroup);
} else {
  // 兜底：找不到「官方插件」时退回顶层，避免文档丢失
  finalSidebar.push(vfxPluginGroup);
}
fs.writeFileSync(path.posix.join(DEST, 'src/sidebar.generated.json'), JSON.stringify(finalSidebar, null, 2));

console.log(`✓ 文档 ${mdCount} 篇 · 资源 ${mediaCount} 个 · 占位页 ${stubCount} 个`);
console.log(`✓ 侧栏 ${finalSidebar.length} 个顶层分组`);

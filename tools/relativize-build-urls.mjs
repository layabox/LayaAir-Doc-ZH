/**
 * 把 _book 里写死的 /3.x/doc/... 改成相对路径（JS 则改为运行时推站点根）。
 *
 * 原因：Astro 构建必须带 base=/3.x/doc，线上才能挂到该子目录；
 * 但本地用 anywhere 把 _book 当站点根打开时，绝对路径会去请求 /3.x/doc/...，
 * 而 _book 之外的文件在本地和服务器上都不存在。
 *
 * 相对路径在两种部署下都能解析到 _book 内部：
 *   本地 anywhere：http://127.0.0.1:PORT/released/minigame/  + ../../_astro/x.css
 *   线上子目录：  https://www.layaair.com/3.x/doc/released/minigame/ + ../../_astro/x.css
 *
 * canonical / og:url / sitemap 仍是 https://www.layaair.com/3.x/doc/...，不改。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', '_book');
const BASE = '/3.x/doc';
const TEXT_EXT = new Set(['.html', '.js', '.css', '.svg', '.xml', '.json', '.mjs']);
const SKIP_DIR = new Set(['pagefind', 'pagefind-v4']);
const PORTABLE_BASE_MARK = 'data-laya-portable-base';
const RUNTIME_ROOT = '(new URL("../",import.meta.url).pathname.replace(/\\/?$/,"/"))';
// 前缀拆开写，避免二次扫描时被当成 /3.x/doc 资源路径改写。
const PORTABLE_BASE_SCRIPT = `<script ${PORTABLE_BASE_MARK}>(function(){var prefix="/"+["3.x","doc"].join("/");var p=location.pathname;var b=(p===prefix||p.indexOf(prefix+"/")===0)?prefix+"/":"/";document.write('<base href="'+location.origin+b+'">');})();</script>`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIR.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** /3.x/doc/foo/bar/?q#h → 相对 fromDir 的路径。fromDir 为 '' 表示站点根。 */
function toRelative(fromDir, absUrl) {
  const parsed = absUrl.match(/^([^?#]*)([?][^#]*)?(#.*)?$/);
  const pathname = parsed?.[1] || absUrl;
  const search = parsed?.[2] || '';
  const hash = parsed?.[3] || '';
  if (pathname !== BASE && !pathname.startsWith(BASE + '/')) return absUrl;

  const hadTrailingSlash = pathname === BASE || pathname.endsWith('/');
  const rest = pathname.slice(BASE.length).replace(/^\/+|\/+$/g, '');
  const from = fromDir || '.';
  const to = rest || '.';
  let rel = path.posix.relative(from, to);
  if (rel === '' || rel === '.') {
    rel = hadTrailingSlash ? './' : '.';
  } else {
    if (hadTrailingSlash && !rel.endsWith('/')) rel += '/';
    if (!rel.startsWith('.')) rel = `./${rel}`;
  }
  return rel + search + hash;
}

function isHostPrefixed(text, offset) {
  const before = text.slice(Math.max(0, offset - 96), offset);
  return /https?:\/\/[^\s"'<>]*$/.test(before);
}

function rewriteAbsolute(text, fromDir) {
  const held = [];
  const withoutPortable = text.replace(
    /<script[^>]*data-laya-portable-base[^>]*>[\s\S]*?<\/script>/gi,
    (block) => {
      held.push(block);
      return `\0LAYA_PORTABLE_${held.length - 1}\0`;
    },
  );
  const rewritten = withoutPortable.replace(/\/3\.x\/doc(?:\/[^\s"'<>)]*)?/g, (match, offset) => {
    if (isHostPrefixed(withoutPortable, offset)) return match;
    return toRelative(fromDir, match);
  });
  return rewritten.replace(/\0LAYA_PORTABLE_(\d+)\0/g, (_, i) => held[Number(i)]);
}

function rewriteAstroJs(text) {
  let out = text;
  if (out.includes('"/3.x/doc/"')) {
    out = out.replaceAll('"/3.x/doc/"', RUNTIME_ROOT);
  }
  if (out.includes('"/3.x/doc"')) {
    out = out.replaceAll('"/3.x/doc"', `${RUNTIME_ROOT}.replace(/\\/$/,"")`);
  }
  return out;
}

function inject404Base(html) {
  if (/<script[^>]*data-laya-portable-base/i.test(html)) {
    return html.replace(/<script[^>]*data-laya-portable-base[^>]*>[\s\S]*?<\/script>/i, PORTABLE_BASE_SCRIPT);
  }
  return html.replace(/<head[^>]*>/i, (open) => open + PORTABLE_BASE_SCRIPT);
}

function fromDirOf(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  const dir = rel.replace(/\/[^/]+$/, '');
  return dir === rel ? '' : dir;
}

function isAstroChunk(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  return rel.startsWith('_astro/') && /\.m?js$/i.test(rel);
}

function selfCheck() {
  const cases = [
    ['released/minigame', '/3.x/doc/_astro/a.css', '../../_astro/a.css'],
    ['released/minigame', '/3.x/doc/', '../../'],
    ['released/minigame', '/3.x/doc', '../../'],
    ['released/minigame', '/3.x/doc/released/android/', '../android/'],
    ['', '/3.x/doc/_astro/a.css', './_astro/a.css'],
    ['', '/3.x/doc/', './'],
    ['vfx-graph/operator', '/3.x/doc/vfx-graph/code/#x', '../code/#x'],
  ];
  for (const [from, abs, expected] of cases) {
    const got = toRelative(from, abs);
    if (got !== expected) {
      throw new Error(`relativize self-check failed: ${from} + ${abs} => ${got} (expected ${expected})`);
    }
  }
}

selfCheck();

if (!fs.existsSync(DIST)) {
  console.error('relativize-build-urls: 未找到 _book，先 npm run build');
  process.exit(1);
}

const files = walk(DIST).filter((file) => TEXT_EXT.has(path.extname(file).toLowerCase()));
let changedFiles = 0;
let htmlFiles = 0;
let jsFiles = 0;

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  const rel = path.relative(DIST, file).replace(/\\/g, '/');

  if (isAstroChunk(file)) {
    after = rewriteAstroJs(after);
  } else {
    after = rewriteAbsolute(after, fromDirOf(file));
  }

  if (rel.toLowerCase() === '404.html') {
    after = inject404Base(after);
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changedFiles++;
    if (rel.endsWith('.html')) htmlFiles++;
    if (rel.endsWith('.js') || rel.endsWith('.mjs')) jsFiles++;
  }
}

console.log(
  `relativize-build-urls: 已改写 ${changedFiles} 个文件（HTML ${htmlFiles}，JS ${jsFiles}），_book 可独立于 /3.x/doc 前缀运行。`,
);

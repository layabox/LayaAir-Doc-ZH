/**
 * 把构建产物里写死的 Astro base（/3.x/doc/...）改成相对站点根（./_astro/xxx.css），
 * 并在每个 HTML 的 <head> 开头按「当前 URL 里的 /doc/」动态写入 <base>。
 *
 * 同一套 _book 可挂到 /3.x/doc/、/3.4/doc/，或本地 anywhere（_book 即根，无 /doc 则为 /）。
 * canonical / og:url / sitemap 仍是完整 https 地址，不改。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', '_book');
const BASE = '/3.x/doc';
const TEXT_EXT = new Set(['.html', '.js', '.mjs']);
const SKIP_DIR = new Set(['pagefind', 'pagefind-v4']);
const PORTABLE_BASE_MARK = 'data-laya-portable-base';
const RUNTIME_ROOT = '(new URL("../",import.meta.url).pathname.replace(/\\/?$/,"/"))';
const PORTABLE_BASE_SCRIPT = `<script ${PORTABLE_BASE_MARK}>(function(){var m=location.pathname.match(/^(.*?\\/doc)(?=\\/|$)/);var b=m?m[1]+"/":"/";document.write('<base href="'+location.origin+b+'">');})();</script>`;

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

/** /3.x/doc/foo/bar/?q#h → ./foo/bar/?q#h */
function stripBase(absUrl) {
  const parsed = absUrl.match(/^([^?#]*)([?][^#]*)?(#.*)?$/);
  const pathname = parsed?.[1] || absUrl;
  const search = parsed?.[2] || '';
  const hash = parsed?.[3] || '';
  if (pathname !== BASE && !pathname.startsWith(BASE + '/')) return absUrl;
  let rest = pathname.slice(BASE.length).replace(/^\/+/, '');
  if (!rest) rest = './';
  else if (!rest.startsWith('.')) rest = `./${rest}`;
  return rest + search + hash;
}

function isHostPrefixed(text, offset) {
  const before = text.slice(Math.max(0, offset - 96), offset);
  return /https?:\/\/[^\s"'<>]*$/.test(before);
}

function rewriteHtml(text, pagePath) {
  const held = [];
  let html = text.replace(
    /<script[^>]*data-laya-portable-base[^>]*>[\s\S]*?<\/script>/gi,
    (block) => {
      held.push(block);
      return `\0LAYA_PORTABLE_${held.length - 1}\0`;
    },
  );

  html = html.replace(/\/3\.x\/doc(?:\/[^\s"'<>)]*)?/g, (match, offset) => {
    if (isHostPrefixed(html, offset)) return match;
    return stripBase(match);
  });

  const hashPrefix = pagePath ? `${pagePath.replace(/\/?$/, '/')}` : './';
  html = html.replace(/\bhref=(["'])#([^"']*)\1/g, (_, q, hash) => `href=${q}${hashPrefix}#${hash}${q}`);

  html = html.replace(/\0LAYA_PORTABLE_(\d+)\0/g, (_, i) => held[Number(i)]);
  return injectPortableBase(html);
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

function injectPortableBase(html) {
  if (/<script[^>]*data-laya-portable-base/i.test(html)) {
    return html.replace(/<script[^>]*data-laya-portable-base[^>]*>[\s\S]*?<\/script>/i, PORTABLE_BASE_SCRIPT);
  }
  return html.replace(/<head[^>]*>/i, (open) => open + PORTABLE_BASE_SCRIPT);
}

function pagePathOf(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel.toLowerCase() === 'index.html') return '';
  if (rel.toLowerCase().endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  return rel;
}

function isAstroChunk(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  return rel.startsWith('_astro/') && /\.m?js$/i.test(rel);
}

function selfCheck() {
  const cases = [
    ['/3.x/doc/_astro/a.css', './_astro/a.css'],
    ['/3.x/doc/', './'],
    ['/3.x/doc', './'],
    ['/3.x/doc/ide/', './ide/'],
    ['/3.x/doc/ide/component/#x', './ide/component/#x'],
  ];
  for (const [abs, expected] of cases) {
    const got = stripBase(abs);
    if (got !== expected) {
      throw new Error(`relativize self-check failed: ${abs} => ${got} (expected ${expected})`);
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

  if (isAstroChunk(file)) {
    after = rewriteAstroJs(after);
  } else if (file.toLowerCase().endsWith('.html')) {
    after = rewriteHtml(after, pagePathOf(file));
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changedFiles++;
    if (file.toLowerCase().endsWith('.html')) htmlFiles++;
    if (/\.m?js$/i.test(file)) jsFiles++;
  }
}

console.log(
  `relativize-build-urls: 已改写 ${changedFiles} 个文件（HTML ${htmlFiles}，JS ${jsFiles}），资源一律相对站点根 + <base>。`,
);

/**
 * 把构建产物里写死的 Astro base（/3.x/doc/...）改成相对站点根（./_astro/xxx.css），
 * 并在每个 HTML 的 <head> 开头写入按页面深度计算的静态 <base>。静态标签先于
 * 脚本和样式出现，浏览器预加载扫描器不会再把 ./_astro 解析到当前章节目录。
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

function hashPrefixFor(pagePath) {
  if (!pagePath) return './';
  // 目录路由需要结尾斜杠；404.html 这类真实文件不能变成 404.html/。
  return /\.html?$/i.test(pagePath) ? pagePath : pagePath.replace(/\/?$/, '/');
}

function relativeBaseFor(pagePath) {
  const directory = !pagePath
    ? ''
    : pagePath.endsWith('/')
      ? pagePath.replace(/\/+$/, '')
      : path.posix.dirname(pagePath);
  const depth = directory && directory !== '.'
    ? directory.split('/').filter(Boolean).length
    : 0;
  return depth ? '../'.repeat(depth) : './';
}

function portableBaseTag(pagePath) {
  return `<base ${PORTABLE_BASE_MARK} href="${relativeBaseFor(pagePath)}">`;
}

function rewriteHtml(text, pagePath) {
  let hadPortableBase = false;
  let html = text.replace(
    /(?:<script[^>]*data-laya-portable-base[^>]*>[\s\S]*?<\/script>|<base[^>]*data-laya-portable-base[^>]*>)/gi,
    () => {
      hadPortableBase = true;
      return '\0LAYA_PORTABLE_BASE\0';
    },
  );

  html = html.replace(/\/3\.x\/doc(?:\/[^\s"'<>)]*)?/g, (match, offset) => {
    if (isHostPrefixed(html, offset)) return match;
    return stripBase(match);
  });

  const hashPrefix = hashPrefixFor(pagePath);
  html = html.replace(/\bhref=(["'])#([^"']*)\1/g, (_, q, hash) => `href=${q}${hashPrefix}#${hash}${q}`);

  const baseTag = portableBaseTag(pagePath);
  if (hadPortableBase) {
    let emitted = false;
    return html.replace(/\0LAYA_PORTABLE_BASE\0/g, () => {
      if (emitted) return '';
      emitted = true;
      return baseTag;
    });
  }
  return html.replace(/<head[^>]*>/i, (open) => open + baseTag);
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
  const hashCases = [
    ['', './'],
    ['ide/component/', 'ide/component/'],
    ['404.html', '404.html'],
  ];
  for (const [pagePath, expected] of hashCases) {
    const got = hashPrefixFor(pagePath);
    if (got !== expected) {
      throw new Error(`relativize hash self-check failed: ${pagePath} => ${got} (expected ${expected})`);
    }
  }
  const baseCases = [
    ['', './'],
    ['404.html', './'],
    ['ide/component/', '../../'],
    ['basics/common/network/http/', '../../../../'],
    ['guides/demos/a/page.html', '../../../'],
  ];
  for (const [pagePath, expected] of baseCases) {
    const got = relativeBaseFor(pagePath);
    if (got !== expected) {
      throw new Error(`relativize base self-check failed: ${pagePath} => ${got} (expected ${expected})`);
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

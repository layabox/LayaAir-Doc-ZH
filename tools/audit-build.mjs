import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, '_book');
const BASE = '/3.x/doc';
const ORIGIN = 'https://audit.local';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

function pageUrl(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return `${ORIGIN}${BASE}/`;
  if (rel.endsWith('/index.html')) return `${ORIGIN}${BASE}/${rel.slice(0, -10)}`;
  return `${ORIGIN}${BASE}/${rel}`;
}

function resolveTarget(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded !== BASE && !decoded.startsWith(BASE + '/')) return { outsideBase: true };
  const rel = decoded.slice(BASE.length).replace(/^\/+/, '');
  if (!rel) return { file: path.join(DIST, 'index.html') };
  const exact = path.join(DIST, ...rel.split('/'));
  const candidates = [exact, exact + '.html', path.join(exact, 'index.html')];
  return { file: candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) };
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
const sourceFiles = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => resolveTarget(new URL(match[1]).pathname)?.file)
  .filter(Boolean);
const notFoundPage = path.join(DIST, '404.html');
if (fs.existsSync(notFoundPage)) sourceFiles.push(notFoundPage);
const idCache = new Map();
const failures = [];
let references = 0;

function idsFor(file) {
  if (!idCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1])));
  }
  return idCache.get(file);
}

function check(raw, fromFile, baseUrl, kind) {
  raw = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!raw || raw.startsWith('#') || /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) return;
  let url;
  try { url = new URL(raw, baseUrl); } catch {
    failures.push({ type: 'invalid-url', fromFile, raw, kind });
    return;
  }
  if (url.origin !== ORIGIN) return;
  references++;
  const target = resolveTarget(url.pathname);
  if (target?.outsideBase) {
    failures.push({ type: 'outside-base', fromFile, raw, kind });
    return;
  }
  if (!target?.file) {
    failures.push({ type: 'missing', fromFile, raw, kind });
    return;
  }
  if (url.hash && /\.html$/i.test(target.file)) {
    let hash;
    try { hash = decodeURIComponent(url.hash.slice(1)); } catch { hash = url.hash.slice(1); }
    if (hash && !idsFor(target.file).has(hash)) {
      failures.push({ type: 'missing-anchor', fromFile, raw, kind });
    }
  }
}

for (let sourceIndex = 0; sourceIndex < sourceFiles.length; sourceIndex++) {
  const file = sourceFiles[sourceIndex];
  const text = fs.readFileSync(file, 'utf8');
  const baseUrl = pageUrl(file);
  if (/\.html$/i.test(file)) {
    const markup = text
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<!--([\s\S]*?)-->/g, '');
    for (const tag of markup.matchAll(/<[^>]+>/g)) {
      for (const match of tag[0].matchAll(/\b(href|src|poster|data-src)=["']([^"']+)["']/gi)) {
        check(match[2], file, baseUrl, match[1].toLowerCase());
        let url;
        try { url = new URL(match[2], baseUrl); } catch {}
        if (url?.origin === ORIGIN) {
          const target = resolveTarget(url.pathname)?.file;
          if (target && /\.css$/i.test(target) && !sourceFiles.includes(target)) sourceFiles.push(target);
        }
      }
    }
    for (const match of markup.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
      for (const item of match[1].split(',')) check(item.trim().split(/\s+/)[0], file, baseUrl, 'srcset');
    }
  }
  const cssText = /\.css$/i.test(file)
    ? text
    : [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  for (const match of cssText.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) {
    check(match[1], file, baseUrl, 'css-url');
  }
}

const unique = new Map();
for (const failure of failures) {
  const rel = path.relative(DIST, failure.fromFile).replace(/\\/g, '/');
  unique.set(`${failure.type}\0${rel}\0${failure.raw}`, { ...failure, fromFile: rel });
}
const result = [...unique.values()];
console.log(`审计文件: ${sourceFiles.length}`);
console.log(`站内资源/链接引用: ${references}`);
console.log(`失败: ${result.length}`);
for (const item of result.slice(0, 100)) {
  console.log(`[${item.type}] ${item.fromFile} -> ${item.raw}`);
}
if (result.length > 100) console.log(`... 其余 ${result.length - 100} 项省略`);
if (result.length) process.exitCode = 1;

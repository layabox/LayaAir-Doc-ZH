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

const distFiles = walk(DIST);
const exactFiles = new Map();
const foldedFiles = new Map();
for (const file of distFiles) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  exactFiles.set(rel, file);
  const folded = rel.toLocaleLowerCase('en-US');
  if (!foldedFiles.has(folded)) foldedFiles.set(folded, []);
  foldedFiles.get(folded).push({ rel, file });
}

function pageUrl(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return `${ORIGIN}${BASE}/`;
  if (rel.endsWith('/index.html')) return `${ORIGIN}${BASE}/${rel.slice(0, -10)}`;
  return `${ORIGIN}${BASE}/${rel}`;
}

function resolveTarget(pathname, allowCaseMismatch = false) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded !== BASE && !decoded.startsWith(BASE + '/')) return { outsideBase: true };
  const rel = decoded.slice(BASE.length).replace(/^\/+/, '');
  if (!rel) return { file: exactFiles.get('index.html') };
  const candidates = [rel, rel + '.html', `${rel.replace(/\/$/, '')}/index.html`];
  for (const candidate of candidates) {
    const file = exactFiles.get(candidate);
    if (file) return { file };
  }
  for (const candidate of candidates) {
    const matches = foldedFiles.get(candidate.toLocaleLowerCase('en-US'));
    if (matches?.length === 1) {
      return {
        file: allowCaseMismatch ? matches[0].file : undefined,
        caseMismatch: true,
        expected: candidate,
        actual: matches[0].rel,
      };
    }
  }
  return {};
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
const sourceFiles = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => resolveTarget(new URL(match[1]).pathname, true)?.file)
  .filter(Boolean);
const notFoundPage = path.join(DIST, '404.html');
if (fs.existsSync(notFoundPage)) sourceFiles.push(notFoundPage);
const idCache = new Map();
const failures = [];
let references = 0;

const redirectFile = path.join(DIST, '.htaccess');
const redirects = new Map();
if (fs.existsSync(redirectFile)) {
  for (const line of fs.readFileSync(redirectFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^Redirect\s+301\s+(\S+)\s+(\S+)$/);
    if (match) redirects.set(match[1], match[2]);
  }
}
for (const rel of exactFiles.keys()) {
  if (!rel.endsWith('/index.html')) continue;
  const dir = rel.slice(0, -'/index.html'.length);
  if (dir === dir.toLowerCase()) continue;
  const target = `${BASE}/${dir}/`;
  const source = target.toLowerCase();
  if (redirects.get(source) !== target) {
    failures.push({ type: 'missing-lowercase-redirect', fromFile: redirectFile, raw: source, kind: 'redirect' });
  }
}
for (const [source, target] of redirects) {
  const resolved = resolveTarget(new URL(target, ORIGIN).pathname);
  if (!resolved?.file) {
    failures.push({ type: 'invalid-redirect-target', fromFile: redirectFile, raw: `${source} -> ${target}`, kind: 'redirect' });
  }
}

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
  if (target?.caseMismatch) {
    failures.push({ type: 'case-mismatch', fromFile, raw, kind, actual: target.actual });
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
  // relativize-build-urls.mjs 会让 HTML 中的相对地址统一依赖文档站根
  // <base>（/3.x/doc/），而不是依赖当前页面目录。CSS 文件里的 url()
  // 仍按 CSS 文件自身地址解析。
  let baseUrl = pageUrl(file);
  if (/\.html$/i.test(file)) {
    const portableBase = text.match(/<base\b[^>]*data-laya-portable-base[^>]*>/i)?.[0];
    if (!portableBase) {
      failures.push({ type: 'missing-portable-base', fromFile: file, raw: '<base>', kind: 'runtime-base' });
    } else {
      const href = portableBase.match(/\bhref=["']([^"']+)["']/i)?.[1];
      try {
        const resolvedBase = new URL(href, pageUrl(file));
        baseUrl = resolvedBase.href;
        if (resolvedBase.origin !== ORIGIN || resolvedBase.pathname !== `${BASE}/`) {
          failures.push({ type: 'invalid-portable-base', fromFile: file, raw: href || '<missing href>', kind: 'runtime-base' });
        }
      } catch {
        failures.push({ type: 'invalid-portable-base', fromFile: file, raw: href || '<missing href>', kind: 'runtime-base' });
      }
      const beforeBase = text.slice(0, text.indexOf(portableBase));
      if (/\b(?:href|src|poster|srcset|data-src)=["']/i.test(beforeBase)) {
        failures.push({ type: 'late-portable-base', fromFile: file, raw: portableBase, kind: 'runtime-base' });
      }
    }
    if (/<script[^>]*data-laya-portable-base/i.test(text)) {
      failures.push({ type: 'dynamic-portable-base', fromFile: file, raw: '<script data-laya-portable-base>', kind: 'runtime-base' });
    }
    if (!text.includes('data-laya-router-base')) {
      failures.push({ type: 'missing-router-base-repair', fromFile: file, raw: 'ClientRouter', kind: 'runtime-base' });
    }
    for (const meta of text.matchAll(/<meta\b[^>]*>/gi)) {
      if (!/\bhttp-equiv=["']Content-Security-Policy["']/i.test(meta[0])) continue;
      const content = meta[0].match(/\bcontent=["']([^"']*)["']/i)?.[1] || '';
      if (/(?:^|;)\s*referrer\s*(?:=|\s)/i.test(content)) {
        failures.push({ type: 'invalid-csp-referrer-directive', fromFile: file, raw: content, kind: 'csp' });
      }
    }
    const markup = text
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<!--([\s\S]*?)-->/g, '');
    for (const tag of markup.matchAll(/<[^>]+>/g)) {
      // <base href> 本身相对页面 URL 解析；其余地址才按生效后的 base URL 解析。
      if (/^<base\b/i.test(tag[0])) continue;
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

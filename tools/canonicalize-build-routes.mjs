import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, '_book');
const base = '/3.x/doc';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

const files = walk(dist);
const routeByFoldedPath = new Map();
const fileByFoldedPath = new Map();
for (const file of files) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  fileByFoldedPath.set(rel.toLowerCase(), rel);
  if (path.basename(file).toLowerCase() !== 'index.html') continue;
  const dir = path.relative(dist, path.dirname(file)).replace(/\\/g, '/');
  const route = dir ? `${base}/${dir}/` : `${base}/`;
  routeByFoldedPath.set(route.toLowerCase(), route);
}

function canonicalUrl(raw) {
  const suffix = raw.slice(base.length + 1);
  const hadTrailingSlash = suffix.endsWith('/');
  const rel = suffix.replace(/^\/+|\/+$/g, '');
  if (!rel) return raw;
  const candidates = hadTrailingSlash
    ? [`${rel}/index.html`]
    : [rel, `${rel}.html`, `${rel}/index.html`];
  for (const candidate of candidates) {
    const actual = fileByFoldedPath.get(candidate.toLowerCase());
    if (!actual) continue;
    const canonicalRel = actual.endsWith('/index.html')
      ? `${actual.slice(0, -'/index.html'.length)}/`
      : actual;
    return `${base}/${canonicalRel}`;
  }
  return raw;
}

// Astro 的 slug 统一为小写，但 Windows 会把路由写入已存在的、保留原始
// 大小写的 public 资源目录。部署到区分大小写的 Linux 后，页面必须引用磁盘
// 中的真实路径。只改写完整页面路由，不触碰图片名、脚本名等静态资源。
const routePattern = /\/3\.x\/doc\/(?:[^\s"'<>?#)]*\/)?/gi;
const resourcePattern = /\/3\.x\/doc\/[^\s"'<>?#)]+/gi;
const textExtensions = new Set(['.html', '.xml', '.js', '.css', '.json']);
let changedFiles = 0;
let changedRoutes = 0;

for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(routePattern, (route) => {
    const canonical = routeByFoldedPath.get(route.toLowerCase());
    if (!canonical || canonical === route) return route;
    changedRoutes++;
    return canonical;
  });
  after = after.replace(resourcePattern, (url) => {
    const canonical = canonicalUrl(url);
    if (canonical !== url) changedRoutes++;
    return canonical;
  });
  if (after !== before) {
    fs.writeFileSync(file, after);
    changedFiles++;
  }
}

console.log(`已按 Linux 大小写规则规范 ${changedFiles} 个文件中的 ${changedRoutes} 条页面路由。`);

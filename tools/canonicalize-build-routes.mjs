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
for (const file of files) {
  if (path.basename(file).toLowerCase() !== 'index.html') continue;
  const dir = path.relative(dist, path.dirname(file)).replace(/\\/g, '/');
  const route = dir ? `${base}/${dir}/` : `${base}/`;
  routeByFoldedPath.set(route.toLowerCase(), route);
}

// Astro 的 slug 统一为小写，但 Windows 会把路由写入已存在的、保留原始
// 大小写的 public 资源目录。部署到区分大小写的 Linux 后，页面必须引用磁盘
// 中的真实路径。只改写完整页面路由，不触碰图片名、脚本名等静态资源。
const routePattern = /\/3\.x\/doc\/(?:[^\s"'<>?#)]*\/)?/gi;
const textExtensions = new Set(['.html', '.xml', '.js', '.css', '.json']);
let changedFiles = 0;
let changedRoutes = 0;

for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(routePattern, (route) => {
    const canonical = routeByFoldedPath.get(route.toLowerCase());
    if (!canonical || canonical === route) return route;
    changedRoutes++;
    return canonical;
  });
  if (after !== before) {
    fs.writeFileSync(file, after);
    changedFiles++;
  }
}

console.log(`已按 Linux 大小写规则规范 ${changedFiles} 个文件中的 ${changedRoutes} 条页面路由。`);

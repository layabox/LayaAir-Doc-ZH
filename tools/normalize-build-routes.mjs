import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, '_book');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

const routeDirs = walk(dist)
  .filter((file) => path.basename(file).toLowerCase() === 'index.html')
  .map((file) => path.relative(dist, path.dirname(file)).replace(/\\/g, '/').toLowerCase());

function belongsToRoute(rel) {
  const folded = rel.replace(/\\/g, '/').toLowerCase();
  return routeDirs.some((route) => route === folded || route.startsWith(`${folded}/`));
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function renameWithRetry(from, to) {
  let lastErr;
  for (let i = 0; i < 12; i++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (err) {
      lastErr = err;
      if (!err || !['EPERM', 'EBUSY', 'EACCES'].includes(err.code)) throw err;
      sleepSync(200 * (i + 1));
    }
  }
  throw new Error(
    `无法重命名 ${from} -> ${to}（${lastErr?.code}）。请先停掉 npm run dev / anywhere，关掉资源管理器里打开的 _book 文件夹，再 npm run build。`,
  );
}

let renamed = 0;
function normalize(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let current = path.join(dir, entry.name);
    let rel = path.relative(dist, current);
    if (!belongsToRoute(rel)) continue;
    const lowerName = entry.name.toLowerCase();
    if (entry.name !== lowerName) {
      const temporary = path.join(dir, `.__route_case_${process.pid}_${renamed}`);
      const target = path.join(dir, lowerName);
      renameWithRetry(current, temporary);
      renameWithRetry(temporary, target);
      current = target;
      renamed++;
    }
    normalize(current);
  }
}

normalize(dist);
console.log(`已将 ${renamed} 个构建路由目录规范为全小写。`);

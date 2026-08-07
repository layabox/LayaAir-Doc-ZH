import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.resolve(root, '_book');
if (path.dirname(dist) !== root || path.basename(dist) !== '_book') {
  throw new Error(`拒绝清理意外路径：${dist}`);
}
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
console.log(`已清理可再生构建目录：${dist}`);

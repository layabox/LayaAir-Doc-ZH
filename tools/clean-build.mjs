import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.resolve(root, '_book');
if (path.dirname(dist) !== root || path.basename(dist) !== '_book') {
  throw new Error(`拒绝清理意外路径：${dist}`);
}
try {
  fs.rmSync(dist, { recursive: true, force: true });
} catch (err) {
  if (err && (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'ENOTEMPTY')) {
    throw new Error(
      `无法删除 _book（${err.code}）：目录正被占用。请先停掉在 _book 里跑的 anywhere / 静态服务器，关掉资源管理器中打开的该文件夹，再 npm run build。`,
    );
  }
  throw err;
}
fs.mkdirSync(dist, { recursive: true });
console.log(`已清理可再生构建目录：${dist}`);

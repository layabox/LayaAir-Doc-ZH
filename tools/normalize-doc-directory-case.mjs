import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
// 路由由小写 slug 生成；只需统一最终会复制到 _book 的 public 目录。
// 源文档目录保留原样，避免破坏 Windows 下供 Markdown 预览使用的 junction。
const roots = [path.join(root, 'public')];
let renamed = 0;

function gitMove(from, to) {
  execFileSync('git', ['mv', from, to], { cwd: root, stdio: 'pipe' });
}

function hasTrackedFiles(dir) {
  const rel = path.relative(root, dir).replace(/\\/g, '/');
  return execFileSync('git', ['ls-files', rel], { cwd: root, encoding: 'utf8' }).trim() !== '';
}

function normalizeDirectories(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const entry of entries) {
    let current = path.join(dir, entry.name);
    const lowerName = entry.name.toLowerCase();
    if (entry.name !== lowerName) {
      // Git 不记录空目录，它们也不会进入发布产物。
      if (!hasTrackedFiles(current)) continue;
      const temporary = path.join(dir, `.__case_${process.pid}_${renamed}`);
      const target = path.join(dir, lowerName);
      gitMove(current, temporary);
      gitMove(temporary, target);
      current = target;
      renamed++;
    }
    normalizeDirectories(current);
  }
}

for (const dir of roots) normalizeDirectories(dir);
console.log(`已将 ${renamed} 个公开资源目录规范为全小写。`);

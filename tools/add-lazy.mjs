// 构建后兜底:给 _book 里所有 <img> 补 loading="lazy" decoding="async"。
// 为什么需要:rehype 插件只能处理 Markdown 标准图 ![](url)；GitBook 源里大量手写的
// HTML <img src=... style="zoom:60%"> 在 mdx 里是 raw HTML，绕过 rehype，所以漏网。
// 这一步直接扫产物 HTML，用 negative-lookahead 正则只给「还没有 loading 属性」的 img 补，
// 不重复、不误伤已处理的图。串在 `npm run build` 之后跑。
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('_book');
let files = 0, patched = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) processFile(full);
  }
}

function processFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  let count = 0;
  // 只匹配 <img 后面紧跟、且该标签内尚无 loading= 的情况
  const out = html.replace(/<img (?![^>]*\bloading=)/g, () => {
    count++;
    return '<img loading="lazy" decoding="async" ';
  });
  if (count > 0) {
    fs.writeFileSync(file, out);
    files++;
    patched += count;
  }
}

if (!fs.existsSync(DIST)) {
  console.error('add-lazy: 未找到 _book，先 npm run build');
  process.exit(1);
}
walk(DIST);
console.log(`add-lazy: 已为 ${patched} 张图补懒加载，覆盖 ${files} 个 HTML 文件`);

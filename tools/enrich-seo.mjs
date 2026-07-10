// SEO 补全（幂等、外科式）：只改 frontmatter，不碰正文 / slug / 链接。
// 1) 正文页缺 description → 从首段正文自动抽取，写入 frontmatter（Starlight 据此生成 <meta name="description"> 与 og:description）。
// 2) 占位页（_stubs，pagefind:false）→ 注入 robots noindex，避免「内容整理中」的瘦页被搜索引擎收录。
// 用法：node enrich-seo.mjs            （只看会改什么，不落盘 → 加 --dry）
import fs from 'node:fs';
import path from 'node:path';

const DOCS = path.resolve('src/content/docs');
const DRY = process.argv.includes('--dry');
const MAX = 155; // meta description 推荐长度上限

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

// 把一段 Markdown 行压成纯文本摘要：去链接/强调/行内代码/HTML 标签，截到 MAX。
function toSummary(line) {
  let s = line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')        // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')      // 链接 → 文字
    .replace(/<[^>]+>/g, '')                       // HTML 标签
    .replace(/[`*_~]/g, '')                        // 行内修饰符
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length > MAX) s = s.slice(0, MAX).replace(/[，。、,.\s][^，。、,.\s]*$/, '') + '…';
  return s;
}

// 从正文里挑第一段「真正的散文」：跳过标题 / import / JSX / 提示框 / 列表 / 表格 / 空行。
function firstParagraph(body) {
  const lines = body.split(/\r?\n/);
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (/^#{1,6}\s/.test(t)) continue;            // 标题
    if (/^import\s/.test(t)) continue;            // MDX import
    if (/^[<:]/.test(t)) continue;                // JSX 标签 / ::: 提示框
    if (/^[-*+]\s|^\d+\.\s|^>\s|^\|/.test(t)) continue; // 列表 / 引用 / 表格
    if (/^[-=]{3,}$/.test(t)) continue;           // 分隔线
    const s = toSummary(t);
    if (s.length >= 10) return s;                  // 太短的略过，继续找
  }
  return '';
}

const NOINDEX = [
  '  - tag: meta',
  '    attrs:',
  '      name: robots',
  '      content: noindex',
].join('\n');

let descAdded = 0, noindexAdded = 0, skipped = 0;
for (const file of walk(DOCS)) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) { skipped++; continue; }
  let fm = m[1];
  const body = txt.slice(m[0].length);
  const isStub = file.includes(`${path.sep}_stubs${path.sep}`) || /\npagefind:\s*false/.test('\n' + fm);
  let changed = false;

  if (isStub) {
    // 占位页：补 noindex（已有则跳过）
    if (!/\nhead:/.test('\n' + fm) && !/robots/.test(fm)) {
      fm += `\nhead:\n${NOINDEX}`;
      noindexAdded++; changed = true;
    }
  } else if (!/\ndescription:/.test('\n' + fm)) {
    // 正文页：缺 description 才补
    const desc = firstParagraph(body);
    if (desc) {
      // 插在 title 之后，读起来更顺；找不到 title 就放末尾
      if (/\ntitle:/.test('\n' + fm)) {
        fm = fm.replace(/(title:.*)(\n|$)/, `$1\ndescription: ${JSON.stringify(desc)}$2`);
      } else {
        fm += `\ndescription: ${JSON.stringify(desc)}`;
      }
      descAdded++; changed = true;
    }
  }

  if (changed && !DRY) fs.writeFileSync(file, `---\n${fm}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`);
}

console.log(`${DRY ? '[dry-run] ' : ''}description 补全 ${descAdded} 页 · 占位页 noindex ${noindexAdded} 页 · 跳过(无 frontmatter) ${skipped}`);

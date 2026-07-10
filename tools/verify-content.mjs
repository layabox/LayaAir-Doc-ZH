// 内容一致性校验:逐页检查源 Markdown 的文本是否都出现在 _book 构建产物里。
// 用法:node tools/verify-content.mjs   (需先 npm run build)
// 原理:源文与 HTML 双侧都洗掉语法/标签/空白/标点变体后,按"源文行 ⊆ 页面文本"做包含校验。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');
const BOOK = path.join(ROOT, '_book');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.mdx?$/i.test(e.name)) out.push(p);
  }
  return out;
}

// 双侧统一归一化:去空白、智能标点还原、对称移除 markdown 修饰符
// （`*_~|` 在源文里既可能是语法也可能是实义字符,两侧都删才能对称比较）
function norm(s) {
  return s
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...')
    .replace(/[`*_~|\\]/g, '')
    .replace(/\s+/g, '');
}

function mdLines(body) {
  const lines = [];
  let inFence = false;
  for (let raw of body.split('\n')) {
    const t = raw.trim();
    if (/^(`{3,}|~{3,})/.test(t)) { inFence = !inFence; continue; }
    if (inFence) { if (t && !t.includes('<')) lines.push(t); continue; } // 代码行原样(shiki 保留文本);含 < 的行涉及实体转义差异,跳过
    if (!t || /^:::/.test(t) || /^\|[\s:|-]+\|$/.test(t)) continue;
    if (t.includes('<')) continue; // 内嵌原生 HTML 的行两侧形态不同,无法对称比较
    let s = t
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/, '')
      .replace(/^>\s?/, '')
      .replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
    if (norm(s).length >= 8) lines.push(s);
  }
  return lines;
}

function htmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

let pages = 0, okPages = 0, missingPages = [], badLines = 0;
const problems = [];
for (const f of walk(DOCS)) {
  const raw = fs.readFileSync(f, 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fm) continue;
  if (/^draft:\s*true/m.test(fm[1])) continue; // draft 页不上线,跳过
  const slugM = fm[1].match(/^slug:\s*"([^"]*)"/m);
  const slug = slugM ? slugM[1] : '';
  const htmlPath = path.join(BOOK, slug, 'index.html');
  pages++;
  if (!fs.existsSync(htmlPath)) { missingPages.push(slug || '(root)'); continue; }
  const hay = norm(htmlText(fs.readFileSync(htmlPath, 'utf8')));
  const misses = [];
  for (const line of mdLines(raw.slice(fm[0].length))) {
    if (!hay.includes(norm(line))) misses.push(line);
  }
  if (misses.length === 0) okPages++;
  else {
    badLines += misses.length;
    problems.push({ slug, misses: misses.slice(0, 3), total: misses.length });
  }
}
console.log(`校验页数: ${pages} | 全文匹配: ${okPages} | 缺页: ${missingPages.length} | 有差异页: ${problems.length} (共 ${badLines} 行)`);
if (missingPages.length) console.log('缺页:', missingPages.slice(0, 10).join(', '));
for (const p of problems.slice(0, 15)) {
  console.log(`\n[${p.slug}] ${p.total} 行未匹配,例:`);
  for (const m of p.misses) console.log('  ·', m.slice(0, 80));
}

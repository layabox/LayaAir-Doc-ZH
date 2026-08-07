import fs from 'node:fs';
import path from 'node:path';

const outputRoot = path.resolve('_book');
const source = path.join(outputRoot, 'pagefind');
const target = path.join(outputRoot, 'pagefind-v4');

if (!fs.existsSync(source)) {
  throw new Error(`Pagefind output was not found: ${source}`);
}

// Pagefind 1.5.2 会在浏览器中再次用 Intl.Segmenter 对中文查询分词。
// Chromium 会把“文档”拆成“文”“档”，与构建索引的词元不一致，导致精确标题搜不到。
// 关闭查询端二次分词，直接把用户输入交给 Pagefind 中文索引。
const segmentationPattern = /var needsWordSegmentation=\(lang\)=>\{if\(!lang\)return false;const primaryLang=lang\.split\("-"\)\[0\]\.toLowerCase\(\);return\["zh","ja","th"\]\.includes\(primaryLang\);\};/;
for (const runtimeName of ['pagefind.js', 'pagefind-worker.js']) {
  const runtimePath = path.join(source, runtimeName);
  const runtime = fs.readFileSync(runtimePath, 'utf8');
  if (!segmentationPattern.test(runtime)) {
    throw new Error(`Unable to locate Pagefind query segmentation code in ${runtimeName}.`);
  }
  fs.writeFileSync(runtimePath, runtime.replace(segmentationPattern, 'var needsWordSegmentation=()=>false;'));
}

fs.rmSync(target, { recursive: true, force: true });

function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, targetPath);
    else fs.copyFileSync(sourcePath, targetPath);
  }
}

copyDirectory(source, target);
console.log('Pagefind search bundle prepared: pagefind-v4');

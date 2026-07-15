/**
 * 一次性 / 可重跑：把正文中能映射到 public/ 的站内绝对图片路径改成相对路径。
 *   /2D/dom/img/1.png  →  ./img/1.png
 *   /IDE/Component/Trail/img/x.png（从 TrailRenderer 页）→ ../../Trail/img/x.png
 *
 * 外链、指向 public 外或无法解析的绝对路径保持不变。
 * 用法：node tools/rewrite-img-to-relative.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageDirFromFilePath, toPageRelative } from './lib/doc-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(root, 'src/content/docs');
const publicDir = path.join(root, 'public');

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|image)(\?|#|$)/i;

function walk(d, a = []) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory()) {
			if (e.name === 'img' || e.name === 'images' || e.name === 'gif') continue;
			walk(p, a);
		} else if (/\.mdx?$/i.test(e.name)) a.push(p);
	}
	return a;
}

function publicExists(absUrl) {
	const rest = absUrl.replace(/^\//, '').split(/[?#]/)[0];
	if (!rest || rest.includes('..')) return false;
	return fs.existsSync(path.join(publicDir, rest));
}

function rewriteContent(content, pageDir) {
	let n = 0;
	const convert = (abs) => {
		if (!IMG_EXT.test(abs)) return abs;
		if (!publicExists(abs)) return abs;
		const rel = toPageRelative(abs, pageDir);
		if (!rel || rel === abs) return abs;
		n++;
		return rel;
	};

	let out = content.replace(
		/(!?\[[^\]]*\]\()(\/[^)\s]+)(\))/g,
		(_, a, url, c) => a + convert(url) + c,
	);

	out = out.replace(
		/(\bsrc\s*=\s*["'])(\/[^"']+)(["'])/gi,
		(_, a, url, c) => a + convert(url) + c,
	);

	return { out, n };
}

let filesChanged = 0;
let refs = 0;
for (const file of walk(docsDir)) {
	const pageDir = pageDirFromFilePath(file);
	if (pageDir == null) continue;
	const raw = fs.readFileSync(file, 'utf8');
	const { out, n } = rewriteContent(raw, pageDir);
	if (n > 0 && out !== raw) {
		fs.writeFileSync(file, out, 'utf8');
		filesChanged++;
		refs += n;
	}
}
console.log(`[rewrite-img-to-relative] files=${filesChanged} refs=${refs}`);

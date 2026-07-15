/**
 * 文档图片路径工具：本地 Markdown 预览用相对路径，站点渲染转成 public 绝对路径。
 *
 * 磁盘约定：
 *   正文：./img/1.png（相对当前 md 所在目录）
 *   实体：public/<文档相对目录>/img/1.png
 *   本地预览：docs 旁的 img → public 镜像链接（见 link-doc-images.mjs）
 */
import path from 'node:path';

export const DOCS_PREFIX = 'src/content/docs/';
export const MEDIA_DIR_NAMES = new Set(['img', 'images', 'gif']);

/** 从任意 filePath 得到 docs 下页面目录（posix，无首尾斜杠），如 `2D/dom`；根页为 `''` */
export function pageDirFromFilePath(filePath) {
	if (!filePath) return null;
	const normalized = String(filePath).replace(/\\/g, '/');
	const idx = normalized.indexOf(DOCS_PREFIX);
	const rel = idx >= 0
		? normalized.slice(idx + DOCS_PREFIX.length)
		: normalized.replace(/^\.?\//, '');
	if (!rel || rel.includes('..')) return null;
	const slash = rel.lastIndexOf('/');
	if (slash < 0) return ''; // 根下的 index.mdx / services.md
	return rel.slice(0, slash);
}

/** 相对路径 → 站内绝对路径（以 / 开头）；已是绝对/外链则原样返回 */
export function toSiteAbsolute(url, pageDir) {
	if (url == null || typeof url !== 'string') return url;
	const u = url.trim();
	if (!u || /^(https?:|data:|\/\/|#)/i.test(u)) return u;
	if (u.startsWith('/')) return u;
	if (pageDir == null) return u;

	const base = pageDir ? pageDir.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') + '/' : '';
	const joined = path.posix.normalize(base + u.replace(/^\.\//, ''));
	if (!joined || joined.startsWith('..')) return u;
	return '/' + joined.replace(/^\/+/, '');
}

/**
 * 站内绝对路径 → 相对当前页的路径。
 * 同页：/2D/dom/img/1.png → ./img/1.png
 * 跨页：/IDE/Component/Trail/img/1.png（从 TrailRenderer）→ ../../Trail/img/1.png
 */
export function toPageRelative(absUrl, pageDir) {
	if (!absUrl || typeof absUrl !== 'string') return null;
	const u = absUrl.trim();
	if (!u.startsWith('/')) return null;
	const rest = u.slice(1).replace(/\\/g, '/');
	if (!rest || rest.startsWith('../') || rest.includes('/../')) return null;
	const from = (pageDir || '').replace(/^\/+|\/+$/g, '') || '.';
	const rel = path.posix.relative(from, rest);
	if (!rel || path.posix.isAbsolute(rel)) return null;
	if (rel.startsWith('../') || rel === '..') return rel;
	return './' + rel.replace(/^\.\//, '');
}

/** 正文是否引用了某张本页 img 目录下的图片（兼容绝对 / 相对两种写法） */
export function contentRefsImg(content, relDir, name) {
	const abs = '/' + (relDir ? relDir + '/' : '') + 'img/' + name;
	return (
		content.includes(abs) ||
		content.includes('./img/' + name) ||
		content.includes('(img/' + name) ||
		content.includes('src="img/' + name) ||
		content.includes("src='img/" + name)
	);
}

/** 从 markdown/html 里收集本页 img/ 下被引用的规范序号文件名 */
export function collectImgRefs(content, relDir) {
	const absPrefix = '/' + (relDir ? relDir + '/' : '') + 'img/';
	const patterns = [
		new RegExp(
			absPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
				'(\\d{1,3}(?:-\\d{1,3})*\\.(?:png|jpe?g|gif|webp))',
			'gi',
		),
		/(?:\(|(?:src\s*=\s*["']))(?:\.\/)?img\/(\d{1,3}(?:-\d{1,3})*\.(?:png|jpe?g|gif|webp))/gi,
	];
	const refs = [];
	for (const re of patterns) {
		re.lastIndex = 0;
		for (let m; (m = re.exec(content)); ) {
			refs.push({ name: m[1].toLowerCase(), idx: m.index });
		}
	}
	return refs;
}

/** 解析换图 URL → 文件名（支持绝对与 ./img/） */
export function imgNameFromReplaceUrl(replaceUrl, relDir) {
	if (!replaceUrl || typeof replaceUrl !== 'string') return null;
	const absPrefix = '/' + (relDir ? relDir + '/' : '') + 'img/';
	const lower = replaceUrl;
	if (lower.toLowerCase().startsWith(absPrefix.toLowerCase())) {
		const name = replaceUrl.slice(absPrefix.length);
		return /^[\w.-]+\.(png|jpe?g|gif|webp)$/i.test(name) ? name : null;
	}
	const rel = replaceUrl.replace(/^\.\//, '');
	if (rel.toLowerCase().startsWith('img/')) {
		const name = rel.slice(4);
		return /^[\w.-]+\.(png|jpe?g|gif|webp)$/i.test(name) ? name : null;
	}
	return null;
}

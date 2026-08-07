/**
 * Remark 插件：把文档里的相对图片路径转成站内绝对路径，
 * 避免 Astro 把相对图走资源管线，并保证 slug 大小写与 public 一致。
 */
import { pageDirFromFilePath, toSiteAbsolute } from './lib/doc-images.mjs';

function withBase(url, base) {
	if (!url || !url.startsWith('/') || url.startsWith('//')) return url;
	if (!base || url === base || url.startsWith(base + '/')) return url;
	return base + url;
}

function rewriteHtmlUrls(html, pageDir, base) {
	return html.replace(/(\b(?:href|src|poster)\s*=\s*["'])([^"']+)(["'])/gi, (_, a, url, c) => {
		const isImage = /\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(url);
		const resolved = isImage ? toSiteAbsolute(url, pageDir) : url;
		return a + withBase(resolved, base) + c;
	});
}

export function remarkDocImages({ base = '' } = {}) {
	base = ('/' + base).replace(/\/{2,}/g, '/').replace(/\/$/, '');
	if (base === '/') base = '';
	return (tree, file) => {
		const filePath = file.path || file.history?.[0] || '';
		const sourcePageDir = pageDirFromFilePath(filePath);
		// 部署到 Linux/Tengine 时路径区分大小写。公开资源目录统一为小写，
		// 文件名仍保留原始大小写。
		const pageDir = sourcePageDir == null ? null : sourcePageDir.toLowerCase();
		if (pageDir == null) return;

		const walk = (node) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'image' && typeof node.url === 'string') {
				node.url = withBase(toSiteAbsolute(node.url, pageDir), base);
			} else if (
				(node.type === 'link' || node.type === 'definition') &&
				typeof node.url === 'string'
			) {
				node.url = withBase(node.url, base);
			} else if (node.type === 'html' && typeof node.value === 'string') {
				node.value = rewriteHtmlUrls(node.value, pageDir, base);
			} else if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
				if (Array.isArray(node.attributes)) {
					for (const attr of node.attributes) {
						if (
							attr?.type === 'mdxJsxAttribute' &&
							['href', 'src', 'poster', 'before', 'after'].includes(attr.name) &&
							typeof attr.value === 'string'
						) {
							const isImageAttr =
								attr.name !== 'href' &&
								/\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(attr.value);
							const resolved = isImageAttr ? toSiteAbsolute(attr.value, pageDir) : attr.value;
							attr.value = withBase(resolved, base);
						}
					}
				}
			}
			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);
	};
}

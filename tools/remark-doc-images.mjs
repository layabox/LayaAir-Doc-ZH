/**
 * Remark 插件：把文档里的相对图片路径转成站内绝对路径，
 * 避免 Astro 把相对图走资源管线，并保证 slug 大小写与 public 一致。
 */
import { pageDirFromFilePath, toSiteAbsolute } from './lib/doc-images.mjs';

function rewriteHtmlSrc(html, pageDir) {
	return html.replace(/(\bsrc\s*=\s*["'])([^"']+)(["'])/gi, (_, a, src, c) => {
		if (!/\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(src)) return a + src + c;
		return a + toSiteAbsolute(src, pageDir) + c;
	});
}

export function remarkDocImages() {
	return (tree, file) => {
		const filePath = file.path || file.history?.[0] || '';
		const pageDir = pageDirFromFilePath(filePath);
		if (pageDir == null) return;

		const walk = (node) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'image' && typeof node.url === 'string') {
				node.url = toSiteAbsolute(node.url, pageDir);
			} else if (node.type === 'html' && typeof node.value === 'string') {
				node.value = rewriteHtmlSrc(node.value, pageDir);
			} else if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
				// MDX <img src="./img/x" />
				if (node.name === 'img' && Array.isArray(node.attributes)) {
					for (const attr of node.attributes) {
						if (
							attr?.type === 'mdxJsxAttribute' &&
							attr.name === 'src' &&
							typeof attr.value === 'string'
						) {
							attr.value = toSiteAbsolute(attr.value, pageDir);
						}
					}
				}
			}
			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);
	};
}

/** 判断文本是否包含完整搜索词（英文不区分大小写） */
function containsExactPhrase(text: string, term: string): boolean {
	if (/[a-zA-Z]/.test(term)) {
		return text.toLowerCase().includes(term.toLowerCase());
	}
	return text.includes(term);
}

/** 是否应对该查询做全文匹配优先重排 */
export function shouldPrioritizeExactMatch(term: string): boolean {
	const trimmed = term.trim();
	if (trimmed.length < 2) return false;
	// 用户已使用引号精确搜索时，不再二次重排
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) return false;
	return true;
}

/** 将搜索结果列表中全文匹配的条目移到最前 */
function reorderResultList(list: Element, rawTerm: string): void {
	const term = rawTerm.trim();
	if (!shouldPrioritizeExactMatch(term)) return;

	const items = [...list.children];
	if (items.length < 2) return;

	const ranked = items.map((el, index) => ({
		el,
		exact: containsExactPhrase(el.textContent || '', term),
		index,
	}));

	const needsReorder = ranked.some((item, i) => {
		const target = ranked
			.slice()
			.sort((a, b) => {
				if (a.exact !== b.exact) return a.exact ? -1 : 1;
				return a.index - b.index;
			})[i];
		return target.el !== items[i];
	});
	if (!needsReorder) return;

	ranked.sort((a, b) => {
		if (a.exact !== b.exact) return a.exact ? -1 : 1;
		return a.index - b.index;
	});
	for (const { el } of ranked) list.appendChild(el);
}

/**
 * 监听 PagefindUI 渲染的搜索结果，将含完整搜索词的结果提升到最前。
 * Pagefind 的 search 是 ES 模块只读导出，无法直接 monkey-patch，因此在 DOM 层重排。
 */
export function attachSearchResultReorder(
	container: HTMLElement,
	getRawTerm: () => string,
): void {
	let reordering = false;

	const tryReorder = () => {
		if (reordering) return;
		const list = container.querySelector('ol.pagefind-ui__results');
		if (!list) return;

		reordering = true;
		try {
			reorderResultList(list, getRawTerm());
		} finally {
			reordering = false;
		}
	};

	const observer = new MutationObserver(() => {
		tryReorder();
	});

	observer.observe(container, { childList: true, subtree: true });
}

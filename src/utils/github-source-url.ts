import { DOC_VERSION, GITHUB_DOC_REPO } from '../constants/doc-version';

const DOCS_PREFIX = 'src/content/docs/';

/** 引擎版本号 → GitHub 分支名，例如 3.4 → LayaAir3.4 */
export function getDocVersionBranch(version: string = DOC_VERSION): string {
	return `LayaAir${version}`;
}

/**
 * Astro 文档文件路径 → GitHub 仓库中的源文件路径。
 * 规则与 migrate.mjs 互逆：index.md(x) → readme.md，根首页 → index.md。
 */
export function astroFileToGithubPath(filePath: string, slug?: string): string | null {
	const normalized = filePath.replace(/\\/g, '/');
	const idx = normalized.indexOf(DOCS_PREFIX);
	if (idx < 0) return null;

	let rel = normalized.slice(idx + DOCS_PREFIX.length);

	// 占位页：按 slug 还原为仓库中的目录 + readme.md
	if (rel.startsWith('_stubs/')) {
		if (!slug) return null;
		return `${slug}/readme.md`;
	}

	const slash = rel.lastIndexOf('/');
	const dir = slash >= 0 ? rel.slice(0, slash) : '';
	const base = slash >= 0 ? rel.slice(slash + 1) : rel;
	const baseLower = base.toLowerCase();

	if (baseLower === 'index.md' || baseLower === 'index.mdx') {
		if (!dir) return 'index.md';
		return `${dir}/readme.md`;
	}

	return rel;
}

/** 生成当前页在 GitHub 仓库中的 blob 链接；无法映射时退回分支根目录 */
export function getGithubSourceUrl(
	filePath?: string,
	version: string = DOC_VERSION,
	slug?: string,
): string {
	const branch = getDocVersionBranch(version);
	if (!filePath) {
		return `${GITHUB_DOC_REPO}/tree/${branch}`;
	}
	const ghPath = astroFileToGithubPath(filePath, slug);
	if (!ghPath) {
		return `${GITHUB_DOC_REPO}/tree/${branch}`;
	}
	return `${GITHUB_DOC_REPO}/blob/${branch}/${ghPath}`;
}

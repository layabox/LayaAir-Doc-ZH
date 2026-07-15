import { DOC_VERSION, GITHUB_DOC_REPO } from '../constants/doc-version';

/** 文档源文件在仓库中的根路径前缀（与 GitHub 目录一致） */
const DOCS_PREFIX = 'src/content/docs/';

/** 引擎版本号 → GitHub 分支名，例如 3.4 → LayaAir3.4 */
export function getDocVersionBranch(version: string = DOC_VERSION): string {
	return `LayaAir${version}`;
}

/**
 * Astro 文档文件路径 → GitHub 仓库中的源文件路径。
 * 本地与 GitHub 目录结构相同，直接保留 `src/content/docs/...` 相对路径。
 */
export function astroFileToGithubPath(filePath: string): string | null {
	const normalized = filePath.replace(/\\/g, '/');
	const idx = normalized.indexOf(DOCS_PREFIX);
	if (idx < 0) return null;
	return normalized.slice(idx);
}

/** 生成当前页在 GitHub 仓库中的 blob 链接；无法映射时退回分支根目录 */
export function getGithubSourceUrl(
	filePath?: string,
	version: string = DOC_VERSION,
): string {
	const branch = getDocVersionBranch(version);
	if (!filePath) {
		return `${GITHUB_DOC_REPO}/tree/${branch}`;
	}
	const ghPath = astroFileToGithubPath(filePath);
	if (!ghPath) {
		return `${GITHUB_DOC_REPO}/tree/${branch}`;
	}
	return `${GITHUB_DOC_REPO}/blob/${branch}/${ghPath}`;
}

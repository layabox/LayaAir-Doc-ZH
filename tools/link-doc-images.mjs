/**
 * 在 src/content/docs 下为 public 中的图片目录创建本地镜像链接，
 * 使 Markdown 相对路径 ./img/xxx 能在 VS Code / Cursor / Typora 中实时预览。
 *
 * Windows：目录联接 (junction，无需管理员)
 * 其它平台：目录符号链接
 *
 * 用法：node tools/link-doc-images.mjs
 * 由 npm run dev / postinstall 自动调用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MEDIA_DIR_NAMES } from './lib/doc-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const docsDir = path.join(root, 'src', 'content', 'docs');

function walkMediaDirs(dir, out = []) {
	if (!fs.existsSync(dir)) return out;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (!e.isDirectory()) continue;
		const full = path.join(dir, e.name);
		if (MEDIA_DIR_NAMES.has(e.name)) out.push(full);
		else walkMediaDirs(full, out);
	}
	return out;
}

function isLink(p) {
	try {
		return fs.lstatSync(p).isSymbolicLink();
	} catch {
		return false;
	}
}

/** Windows junction：lstat 常显示为普通目录，用检查是否与 public 指向同一路径 */
function alreadyLinked(docsSide, publicSide) {
	if (!fs.existsSync(docsSide)) return false;
	if (isLink(docsSide)) return true;
	try {
		// junction：与目标同 inode 不可靠；比对realpath
		return fs.realpathSync(docsSide) === fs.realpathSync(publicSide);
	} catch {
		return false;
	}
}

function linkDir(publicSide, docsSide) {
	const parent = path.dirname(docsSide);
	if (!fs.existsSync(parent)) return { skipped: true, reason: 'no-doc-dir' };
	if (alreadyLinked(docsSide, publicSide)) return { ok: true, existed: true };

	if (fs.existsSync(docsSide)) {
		// 真实目录且非联接：不覆盖，避免误伤
		if (!isLink(docsSide)) {
			return { skipped: true, reason: 'real-dir-exists' };
		}
		fs.unlinkSync(docsSide);
	}

	if (process.platform === 'win32') {
		// mklink /J 要「链接」和「目标」都用 Windows 路径
		execFileSync('cmd', ['/c', 'mklink', '/J', docsSide, publicSide], {
			stdio: 'pipe',
		});
	} else {
		fs.symlinkSync(publicSide, docsSide, 'dir');
	}
	return { ok: true, created: true };
}

let created = 0;
let existed = 0;
let skipped = 0;
const mediaDirs = walkMediaDirs(publicDir);

// 首页等资源直接落在非 img/images/gif 目录名下，额外做整目录联接
const EXTRA_DIRS = ['basics/index'];
for (const rel of EXTRA_DIRS) {
	const publicSide = path.join(publicDir, rel);
	if (fs.existsSync(publicSide)) mediaDirs.push(publicSide);
}

for (const publicSide of mediaDirs) {
	const rel = path.relative(publicDir, publicSide);
	const docsSide = path.join(docsDir, rel);
	const r = linkDir(publicSide, docsSide);
	if (r.created) created++;
	else if (r.existed) existed++;
	else skipped++;
}

console.log(
	`[link-doc-images] targets=${mediaDirs.length} created=${created} existed=${existed} skipped=${skipped}`,
);

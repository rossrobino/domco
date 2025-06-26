import { dirNames } from "../../constants/index.js";
import type { PathLike } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Finds files within a directory by file name.
 *
 * @param options
 * @returns An object, keys are relative paths, values are file paths.
 */
export const findFiles = async (options: {
	/** Directory to search */
	dir: string;

	/** Endings names to search for */
	checkEndings?: string[];

	/**
	 * Ensures all paths are relative to the same root,
	 * for recursive calls, the same root is passed into each
	 * call by default.
	 *
	 * @default options.dir
	 */
	root?: string;

	/**
	 * Directories to not look into
	 *
	 * @default ["dist"]
	 */
	skipDirs?: string[];
}) => {
	let { dir, checkEndings = [""], root, skipDirs = ["dist"] } = options;

	// for recursion, needs to be set
	if (!root) root = dir;

	const paths: Record<string, string> = {};

	const files = await fs.readdir(dir, { withFileTypes: true });

	const subDirPromises: Promise<Record<string, string>>[] = [];

	for (const file of files) {
		if (file.isDirectory()) {
			subDirPromises.push(
				findFiles({ dir: path.join(dir, file.name), checkEndings, root }),
			);
		} else if (checkEnding({ checkEndings, fileName: file.name })) {
			const relativePath = path.relative(root, dir);

			if (skipDirs.includes(relativePath)) continue;

			paths[`/${toPosix(relativePath)}`] = path.join("/", dir, file.name);
		}
	}

	const subDirPaths = await Promise.all(subDirPromises);

	for (const sdp of subDirPaths) {
		Object.assign(paths, sdp);
	}

	return paths;
};

/**
 * Checks if there is a filename that ends with the name.
 */
const checkEnding = (options: { checkEndings: string[]; fileName: string }) => {
	for (const name of options.checkEndings) {
		if (options.fileName.endsWith(name)) return true;
	}

	return false;
};

/**
 * @param filePath
 * @returns `true` if the file exists
 */
export const fileExists = async (filePath: PathLike) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

/**
 *
 * @param s string to modify.
 * @returns string with all forward slashes replaced with back slashes.
 */
export const toPosix = (s: string) => s.replaceAll("\\", "/");

/**
 *
 * @param s string to add endings to
 * @returns an array containing s with js/ts/jsx/tsx endings.
 */
export const toAllScriptEndings = (s: string) => {
	const endings = ["js", "ts", "jsx", "tsx"];
	return endings.map((ending) => `${s}.${ending}`);
};

/**
 * Removes a directory and all of its contents,
 * then makes an empty dir with the same name.
 *
 * @param dir
 */
export const clearDir = async (dir: string) => {
	if (await fileExists(dir)) {
		await fs.rm(dir, { recursive: true });
	}

	await fs.mkdir(dir, { recursive: true });
};

/**
 * Copies all client files into a directory.
 * @param outDir target directory
 */
export const copyClient = async (outDir: string) => {
	return fs.cp(path.join(dirNames.out.base, dirNames.out.client.base), outDir, {
		recursive: true,
		errorOnExist: false,
	});
};

/**
 * Copies all server files into a directory.
 * @param outDir target directory
 */
export const copyServer = async (outDir: string) => {
	return fs.cp(path.join(dirNames.out.base, dirNames.out.ssr), outDir, {
		recursive: true,
		errorOnExist: false,
	});
};

/**
 * Recursively removes empty directories from a directory.
 *
 * @param dir directory to remove empty directories from.
 */
export const removeEmptyDirs = async (dir: string) => {
	const stats = await fs.lstat(dir);
	if (!stats.isDirectory()) return;

	let files = await fs.readdir(dir);

	if (files.length > 0) {
		const tasks = [];

		for (const file of files) {
			tasks.push(removeEmptyDirs(path.join(dir, file)));
		}

		await Promise.all(tasks);

		// read the directory again in case it's now empty,
		// then it will be removed below
		files = await fs.readdir(dir);
	}

	if (files.length === 0) {
		await fs.rmdir(dir);
	}
};

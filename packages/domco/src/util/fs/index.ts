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
	/** directory to search */
	dir: string;

	/** endings names to search for */
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
	 * directories to not look into
	 *
	 * @default ["dist"]
	 */
	skipDirs?: string[];
}) => {
	let { dir, checkEndings = [""], root, skipDirs = ["dist"] } = options;

	// for recursion, needs to be set
	if (!root) root = dir;

	const paths: Record<string, string> = {};

	const files = await fs.readdir(dir, {
		withFileTypes: true,
	});

	for (const file of files) {
		if (file.isDirectory()) {
			// recursively run again
			const subDirPaths = await findFiles({
				dir: path.join(dir, file.name),
				checkEndings,
				root,
			});

			Object.assign(paths, subDirPaths);
		} else if (checkEnding({ checkEndings, fileName: file.name })) {
			const relativePath = path.relative(root, dir);

			if (skipDirs.includes(relativePath)) continue;

			paths[`/${toPosix(relativePath)}`] = path.join("/", dir, file.name);
		}
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
 * @returns true if the file exists
 */
export const fileExists = async (filePath: PathLike) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

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
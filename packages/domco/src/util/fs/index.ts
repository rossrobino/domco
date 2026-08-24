import { dirNames } from "../../constants/index.js";
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
	const { dir, root = dir } = options;

	const paths: Record<string, string> = {};

	for (const filePath of await findFilePaths({ ...options, root })) {
		paths[`/${toPosix(path.relative(root, path.dirname(filePath)))}`] =
			path.join("/", filePath);
	}

	return paths;
};

/**
 * Finds file paths within a directory without collapsing files that share a directory.
 *
 * @param options
 * @returns Matching file paths.
 */
export const findFilePaths = async ({
	dir,
	checkEndings = [""],
	root = dir,
	skipDirs = ["dist"],
}: {
	/** Directory to search */
	dir: string;

	/** Endings names to search for */
	checkEndings?: string[];

	/** Root used to resolve `skipDirs` */
	root?: string;

	/** Directories, relative to `root`, to not look into */
	skipDirs?: string[];
}) => {
	const skips = skipDirs.map(toPosix);

	const walk = async (current: string): Promise<string[]> => {
		const paths: string[] = [];
		const dirs: Promise<string[]>[] = [];

		for (const file of await fs.readdir(current, { withFileTypes: true })) {
			const filePath = path.join(current, file.name);

			if (file.isDirectory()) {
				const relativePath = toPosix(path.relative(root, filePath));

				if (
					skips.some(
						(skip) =>
							relativePath === skip || relativePath.startsWith(`${skip}/`),
					)
				) {
					continue;
				}

				dirs.push(walk(filePath));
			} else if (checkEnding({ checkEndings, fileName: file.name })) {
				paths.push(filePath);
			}
		}

		for (const subDirPaths of await Promise.all(dirs)) {
			paths.push(...subDirPaths);
		}

		return paths;
	};

	return walk(dir);
};

/**
 * Finds the first preferred file name in one directory.
 *
 * @param dir Directory to search.
 * @param fileNames File names in preferred order.
 * @returns The matching file path, if present.
 */
export const findFile = async (dir: string, fileNames: string[]) => {
	let files: string[];

	try {
		files = await fs.readdir(dir);
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT" &&
			"path" in error &&
			error.path === dir
		) {
			return;
		}

		throw error;
	}

	for (const fileName of fileNames) {
		if (files.includes(fileName)) return path.join(dir, fileName);
	}
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
 * Safe, recursive remove if dir exists
 *
 * @param dir directory to remove
 */
export const removeDir = (dir: string) =>
	fs.rm(dir, { recursive: true, force: true });

/**
 * Removes a directory and all of its contents,
 * then makes an empty dir with the same name.
 *
 * @param dir directory to clear.
 */
export const clearDir = async (dir: string) => {
	await removeDir(dir);
	return fs.mkdir(dir, { recursive: true });
};

/**
 * Helper with options for `fs.cp`
 *
 * @param source
 * @param destination
 */
export const copyDir = async (source: string, destination: string) => {
	try {
		return await fs.cp(source, destination, {
			recursive: true,
			errorOnExist: false,
		});
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT" &&
			"path" in error &&
			error.path === source
		) {
			return;
		}

		throw error;
	}
};

/**
 * Copies all client files into a directory.
 * @param destination target directory
 */
export const copyClient = (destination: string) =>
	copyDir(path.join(dirNames.out.base, dirNames.out.client.base), destination);

/**
 * Copies all server files into a directory.
 * @param destination target directory
 */
export const copyServer = (destination: string) =>
	copyDir(path.join(dirNames.out.base, dirNames.out.ssr), destination);

/**
 * Recursively removes empty directories from a directory.
 *
 * @param dir directory to remove empty directories from.
 */
export const removeEmptyDirs = async (dir: string) => {
	const stats = await fs.lstat(dir).catch((error) => {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT" &&
			"path" in error &&
			error.path === dir
		) {
			return;
		}

		throw error;
	});

	if (!stats?.isDirectory()) return;

	const clean = async (current: string) => {
		const files = await fs.readdir(current, { withFileTypes: true });

		if (files.length === 0) return fs.rmdir(current);

		await Promise.all(
			files
				.filter((file) => file.isDirectory())
				.map((file) => clean(path.join(current, file.name))),
		);

		// A direct file means this directory cannot have become empty.
		if (files.some((file) => !file.isDirectory())) return;

		if ((await fs.readdir(current)).length === 0) await fs.rmdir(current);
	};

	await clean(dir);
};

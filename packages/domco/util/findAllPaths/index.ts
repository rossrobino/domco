import path from "node:path";
import fs from "node:fs/promises";

export const findAllPaths = async (options: {
	/** root path to start the search */
	dirPath: string;

	/** file name to search for */
	fileName: string;

	/** relative root path -- root dir in vite.config */
	root: string;
}) => {
	const { dirPath, fileName, root } = options;

	const paths: Record<string, string> = {};

	const files = await fs.readdir(dirPath, {
		withFileTypes: true,
	});

	for (const file of files) {
		if (file.isDirectory()) {
			// recursively run again
			const subDirPaths = await findAllPaths({
				dirPath: path.join(dirPath, file.name),
				fileName,
				root,
			});

			Object.assign(paths, subDirPaths);
		} else if (file.name === fileName) {
			// if matches the file name arg
			let relativePath = path.relative(root, dirPath);

			// fixes issue with "" set as the key,
			// made css filename hash appear after the extension
			if (relativePath === "main") {
				relativePath = "main/";
			} else if (relativePath === "") {
				relativePath = "main";
			}

			paths[relativePath] = path.join(process.cwd(), dirPath, file.name);
		}
	}

	return paths;
};

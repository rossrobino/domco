import path from "node:path";
import fs from "node:fs/promises";
import { info } from "../../info";

export const findAllPaths = async (options: {
	/** root path to start the search */
	dirPath: string;
	/** file name to search for */
	fileName: string;
}) => {
	const { dirPath, fileName } = options;
	const input: Record<string, string> = {};
	const files = await fs.readdir(dirPath, {
		withFileTypes: true,
	});

	for (const file of files) {
		if (file.isDirectory()) {
			const subDirPaths = await findAllPaths({
				dirPath: path.join(dirPath, file.name),
				fileName,
			});
			Object.assign(input, subDirPaths);
		} else if (file.name === fileName) {
			const relativePath = path.relative(info.paths.routes, dirPath);
			input[relativePath] = path.join(process.cwd(), dirPath, file.name);
		}
	}
	return input;
};

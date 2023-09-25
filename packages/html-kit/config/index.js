import path from "node:path";
import fs from "node:fs/promises";

export const info = {
	root: "src/routes",
};

/**
 *
 * @returns {Promise<import("vite").UserConfig>}
 */
export const config = async () => {
	/**
	 * finds the entry points
	 * @param {string} dirPath
	 */
	const entryPoints = async (dirPath) => {
		/** @type {Record<string, string>} */
		const input = {};
		const files = await fs.readdir(dirPath, {
			withFileTypes: true,
		});

		for (const file of files) {
			if (file.isDirectory()) {
				await entryPoints(path.join(dirPath, file.name));
			} else if (file.name === "index.html") {
				const relativePath = path.relative(info.root, dirPath);
				input[relativePath] = path.join(process.cwd(), dirPath, file.name);
			}
		}
		return input;
	};

	const input = await entryPoints(info.root);

	return {
		root: info.root,
		appType: "mpa",
		build: {
			outDir: "../../build",
			emptyOutDir: true,
			rollupOptions: { input },
		},
	};
};

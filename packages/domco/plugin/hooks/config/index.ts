import path from "node:path";
import type { UserConfig } from "vite";
import { info } from "../../../info/index.js";
import { findAllPaths } from "../../../util/findAllPaths/index.js";

export const config = async () => {
	const input = await findAllPaths({
		dirPath: info.paths.root,
		fileName: `${info.files.index}.html`,
	});

	const setConfig = async () => {
		const userConfig: UserConfig = {
			appType: "mpa",
			root: info.paths.root,
			publicDir: info.paths.publicDir,
			resolve: {
				alias: [
					{
						find: "$lib",
						replacement: path.resolve("src", "lib"),
					},
				],
			},
			build: {
				outDir: info.paths.outDir,
				emptyOutDir: true,
				rollupOptions: { input },
				target: "es2022",
			},
		};
		return userConfig;
	};

	return { setConfig: () => setConfig, entryPoints: input };
};

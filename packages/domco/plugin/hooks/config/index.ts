import path from "node:path";
import type { UserConfig } from "vite";
import { info } from "../../../info/index.js";
import { findAllPaths } from "../../../util/findAllPaths/index.js";

export const config = async () => {
	const input = await findAllPaths({
		dirPath: info.paths.routes,
		fileName: `${info.files.index}.html`,
	});
	const setConfig = async () => {
		const userConfig: UserConfig = {
			root: info.paths.routes,
			publicDir: path.join(process.cwd(), "src", "public"),
			resolve: {
				alias: [
					{
						find: "$lib",
						replacement: path.resolve("src", "lib"),
					},
				],
			},
			build: {
				outDir: path.join(process.cwd(), "dist"),
				emptyOutDir: true,
				rollupOptions: { input },
				target: "es2022",
			},
		};
		return userConfig;
	};
	return { setConfig: () => setConfig, entryPoints: input };
};

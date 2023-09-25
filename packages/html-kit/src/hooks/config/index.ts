import path from "node:path";
import type { UserConfig } from "vite";
import { info } from "../../info";
import { findAllPaths } from "../../util/findAllPaths";

export const config = async (): Promise<UserConfig> => {
	const input = await findAllPaths({
		dirPath: info.paths.routes,
		fileName: "index.html",
	});

	return {
		root: info.paths.routes,
		build: {
			outDir: path.join(process.cwd(), "dist"),
			emptyOutDir: true,
			rollupOptions: { input },
		},
	};
};

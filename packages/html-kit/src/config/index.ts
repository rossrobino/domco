import path from "node:path";
import fs from "node:fs/promises";
import type { UserConfig } from "vite";

export const info = {
	paths: {
		routes: "src/routes",
		outDir: "build",
	},
	fileNames: {
		indexBuild: "index.build",
	},
};

export const config = async (): Promise<UserConfig> => {
	const entryPoints = async (dirPath: string) => {
		const input: Record<string, string> = {};
		const files = await fs.readdir(dirPath, {
			withFileTypes: true,
		});

		for (const file of files) {
			if (file.isDirectory()) {
				await entryPoints(path.join(dirPath, file.name));
			} else if (file.name === "index.html") {
				const relativePath = path.relative(info.paths.routes, dirPath);
				input[relativePath] = path.join(process.cwd(), dirPath, file.name);
			}
		}
		return input;
	};

	const input = await entryPoints(info.paths.routes);

	return {
		root: info.paths.routes,
		appType: "mpa",
		build: {
			outDir: info.paths.outDir,
			emptyOutDir: true,
			rollupOptions: { input },
		},
	};
};

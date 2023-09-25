import path from "node:path";
import fs from "node:fs/promises";
import type { UserConfig } from "vite";

export const info = {
	root: "src/routes",
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

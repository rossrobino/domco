import { dirNames, fileNames } from "../../constants/index.js";
import { fileExists } from "../../util/fs/index.js";
import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

export const bundle = async (options: {
	outFile: string;
	platform: "browser" | "node";
}) => {
	await esbuild.build({
		entryPoints: [
			`${dirNames.out.base}/${dirNames.out.ssr}/${fileNames.out.entry.main}`,
		],
		outfile: options.outFile,
		target: "esnext",
		bundle: true,
		platform: options.platform,
		format: "esm",
		logLevel: "error",
		legalComments: "none",
		banner: {
			// https://github.com/evanw/esbuild/issues/1921
			js:
				options.platform === "browser"
					? ""
					: `// BANNER START
const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
// BANNER END
`,
		},
	});
};

export const copyStatic = async (outDir: string) => {
	await fs.cp(path.join(dirNames.out.base, dirNames.out.client.base), outDir, {
		recursive: true,
	});
};

export const clearDir = async (dir: string) => {
	if (await fileExists(dir)) {
		await fs.rm(dir, { recursive: true });
		await fs.mkdir(dir, { recursive: true });
	}
};

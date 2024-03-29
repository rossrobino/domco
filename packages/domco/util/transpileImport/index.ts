import path from "node:path";
import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import os from "node:os";
import { pathToFileURL } from "node:url";

/**
 * Transpile, bundle, and import a TypeScript file using esbuild
 * @param filePath - Path to the TypeScript file
 * @returns The exported content of the transpiled file
 */
export async function transpileImport<T>(filePath: string): Promise<T> {
	const result = await esbuild.build({
		bundle: true,
		format: "esm",
		platform: "node",
		target: "node18",
		entryPoints: [filePath],
		write: false,
		banner: {
			// https://github.com/evanw/esbuild/issues/1921
			js: `
				// BANNER START
				const require = (await import("node:module")).createRequire(import.meta.url);
				const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
				const __dirname = (await import("node:path")).dirname(__filename);
				// BANNER END
			`,
		},
	});

	if (!result.outputFiles || result.outputFiles.length === 0) {
		throw new Error(`No output files found when processing ${filePath}`);
	}

	const firstFile = result.outputFiles.at(0);

	if (typeof firstFile?.text !== "string") {
		throw new Error("Output file has no text property.");
	}

	// temp file to save the transpiled JavaScript
	const tempFilePath = path.join(
		os.tmpdir(),
		`${Math.random().toString(36).slice(2)}.mjs`,
	);
	await fs.writeFile(tempFilePath, firstFile.text);

	// import file as a module -- file url conversion required for windows
	const module = await import(
		String(new URL(pathToFileURL(tempFilePath).href))
	);

	// delete temp file
	await fs.unlink(tempFilePath);

	if (!module) {
		throw new Error(`Error running ${filePath}`);
	}

	return module as T;
}

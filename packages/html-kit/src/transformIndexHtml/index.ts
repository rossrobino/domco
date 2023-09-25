import path from "node:path";
import { parseHTML } from "linkedom";
import { info } from "../config";
import * as esbuild from "esbuild";
import { fileExists } from "../util";
import url from "node:url";
import { Script, createContext } from "node:vm";
import type { IndexHtmlTransform } from "vite";

export const transformIndexHtml: IndexHtmlTransform = {
	handler: async (html, ctx) => {
		const routePath = path.join(info.paths.routes, ctx.originalUrl || "");

		const buildFilePathTs = path.resolve(
			routePath,
			`${info.fileNames.indexBuild}.ts`,
		);
		const buildFilePathJs = path.resolve(
			routePath,
			`${info.fileNames.indexBuild}.js`,
		);
		let buildFilePath = "";

		if (await fileExists(buildFilePathTs)) {
			buildFilePath = buildFilePathTs;
		} else if (await fileExists(buildFilePathJs)) {
			buildFilePath = buildFilePathJs;
		} else {
			return html;
		}

		const { build } = await importBuild(buildFilePath);

		const { document } = parseHTML(html, "text/html");

		const rendered = await build(document);

		return rendered.toString();
	},
};

/**
 * gets the build function from the neighbor `build` file
 * @param buildFilePath
 * @returns an object containing the `build` function
 */
const importBuild = async (buildFilePath: string) => {
	/**
	 * @param {Document} document
	 * @returns the modified document
	 */
	const build = async (document: Document) => document;

	let result: esbuild.BuildResult;
	try {
		result = await esbuild.build({
			bundle: true,
			format: "cjs",
			platform: "node",
			target: "node18",
			entryPoints: [buildFilePath],
			write: false,
		});
	} catch (error) {
		return { build };
	}

	if (!result.outputFiles || result.outputFiles.length === 0) {
		throw new Error("No output files found.");
	}

	const firstFile = result.outputFiles.at(0);

	if (typeof firstFile?.text !== "string") {
		throw new Error("Output file has no text property.");
	}

	const { text } = firstFile;

	const module = { exports: { build } };

	const script = new Script(text);

	const __filename = url.fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const sandbox = { require: () => {}, module, __dirname, __filename };

	const context = createContext(sandbox);

	script.runInContext(context);

	return { build: module.exports.build };
};

import path from "node:path";
import { parseHTML } from "linkedom";
import { info } from "../../info";
import * as esbuild from "esbuild";
import { fileExists } from "../../util";
import url from "node:url";
import { Script, createContext } from "node:vm";
import type { IndexHtmlTransform } from "vite";
import type { Build } from "../../types";

export const transformIndexHtml: IndexHtmlTransform = {
	handler: async (html, ctx) => {
		const route = ctx.originalUrl || "";
		const routePath = path.join(info.paths.routes, route);

		const buildFilePathTs = path.resolve(
			routePath,
			`${info.files.indexBuild}.ts`,
		);
		const buildFilePathJs = path.resolve(
			routePath,
			`${info.files.indexBuild}.js`,
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

		const parseHtmlResult = parseHTML(html, "text/html");

		const result = await build(parseHtmlResult, { route });

		return result.document.toString();
	},
};

/**
 * gets the build function from the neighbor `build` file
 * @param buildFilePath
 * @returns an object containing the `build` function
 */
const importBuild = async (buildFilePath: string) => {
	const build: Build = async ({ document }) => {
		return { document };
	};

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

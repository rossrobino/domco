import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";
import * as esbuild from "esbuild";
import { Script, createContext } from "node:vm";
import { parseHTML } from "linkedom";

/**
 * @param {import("fs").PathLike} file
 * @returns true if the file exists
 */
let fileExists = async (file) => {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
};

/**
 * gets the build function from the neighbor `build` file
 * @param {string} buildFilePath
 * @returns an object containing the `build` function
 */
const importBuild = async (buildFilePath) => {
	/**
	 * @param {Document} document
	 * @returns the modified document
	 */
	let build = async (document) => document;

	/** @type {import("esbuild").BuildResult} */
	let result;
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

/**
 * @typedef {import('vite').PluginOption} PluginOption
 */

/**
 * @type {() => PluginOption}
 */
export default () => {
	const root = path.join("src", "routes");
	return {
		name: "html-kit",
		config: async () => {
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
						const relativePath = path.relative(root, dirPath);
						input[relativePath] = path.join(
							process.cwd(),
							dirPath,
							file.name,
						);
					}
				}
				return input;
			};

			const input = await entryPoints(root);

			return {
				root,
				appType: "mpa",
				build: {
					outDir: "../../build",
					emptyOutDir: true,
					rollupOptions: { input },
				},
			};
		},
		transformIndexHtml: {
			handler: async (html, ctx) => {
				const routePath = path.join(root, ctx.originalUrl || "");
				console.log(html);

				const buildFilePathTs = path.resolve(routePath, "+build.ts");
				console.log(buildFilePathTs);
				const buildFilePathJs = path.resolve(routePath, "+build.js");
				let buildFilePath = "";
				if (await fileExists(buildFilePathTs)) {
					buildFilePath = buildFilePathTs;
				} else if (await fileExists(buildFilePathJs)) {
					buildFilePath = buildFilePathJs;
				} else {
					return html;
				}

				ctx.server?.watcher.on("change", (file) => {
					if (file === buildFilePath) {
						ctx.server?.ws.send({
							type: "full-reload",
						});
					}
				});

				const { build } = await importBuild(buildFilePath);

				const { document } = parseHTML(html, "text/html");

				const rendered = await build(document);

				return rendered.toString();
			},
		},
	};
};

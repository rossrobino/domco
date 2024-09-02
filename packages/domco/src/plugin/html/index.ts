import { setup, dirNames, fileNames } from "../../constants/index.js";
import type { Routes } from "../../types/private/index.js";
import { codeSize } from "../../util/code-size/index.js";
import {
	fileExists,
	findFiles,
	toAllScriptEndings,
	toPosix,
} from "../../util/fs/index.js";
import { getMaxLengths } from "../../util/get-max-lengths/index.js";
import type { Hono } from "hono";
import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import url from "node:url";
import type { HtmlTagDescriptor, Plugin } from "vite";
import process from "node:process";

type StaticFile = { path: string; kB: string; gzip: string };

export const htmlPlugin = (): Plugin => {
	let ssr: boolean | undefined;

	return {
		name: "domco:html-prerender",

		config(_, { isSsrBuild }) {
			ssr = isSsrBuild;
		},

		transformIndexHtml: {
			// the modifications need to be applied `order: "pre"` in order for the linked
			// assets to be updated afterwards
			order: "pre",
			async handler(html, ctx) {
				let pathname: string;

				const dev = ctx.server?.config.command === "serve";

				if (dev) {
					// during dev, `ctx.path` is the whatever is passed into
					// devServer.transformIndexHtml
					pathname = ctx.path;
				} else {
					// during build, `ctx.path` is the path to the HTML relative to root
					pathname = path.dirname(ctx.path);
				}

				const getClientJsPath = async (pathname: string) => {
					const filePath = path.join(
						process.cwd(),
						dirNames.src,
						pathname,
						fileNames.client,
					);

					for (const fileName of toAllScriptEndings(filePath)) {
						if (await fileExists(fileName)) {
							return (
								"/" +
								toPosix(
									path.relative(
										path.join(process.cwd(), dirNames.src),
										fileName,
									),
								)
							);
						}
					}

					return null;
				};

				const injectScript = await getClientJsPath(pathname);

				const tags: HtmlTagDescriptor[] = [];

				if (injectScript) {
					tags.push({
						tag: "script",
						attrs: { type: "module", src: injectScript },
					});
				}

				return { html, tags };
			},
		},

		async writeBundle() {
			if (ssr) {
				const moved = await renameAndRemoveHtml();
				const generated = await generateStatic();

				const staticFiles = [...moved, ...generated];

				staticFiles.sort((a, b) => a.path.localeCompare(b.path));

				if (staticFiles.length) {
					console.log(styleText("bold", "static"));

					const maxLengths = getMaxLengths(staticFiles);

					for (const file of staticFiles) {
						const filePath = file.path.padEnd((maxLengths.path ?? 0) + 2);
						const kB = file.kB.padStart(maxLengths.kB ?? 0) + " kB";
						const gzip = ` │ gzip: ${file.gzip.padStart(maxLengths.gzip ?? 0)} kB`;

						console.log(`${filePath}${styleText("dim", kB + gzip)}`);
					}

					console.log();
				}
			}
		},
	};
};

/**
 * renames pages to `index.html`, deletes pages that have
 * endpoints associated to not clash when serving static files
 */
const renameAndRemoveHtml = async () => {
	const staticFiles: StaticFile[] = [];

	const pageFiles = await findFiles({
		dir: `${dirNames.out.base}/${dirNames.out.client.base}`,
		checkEndings: [fileNames.page],
	});

	const serverFiles = await findFiles({
		dir: dirNames.src,
		checkEndings: toAllScriptEndings(fileNames.server),
	});

	for (const [pagePath, filePath] of Object.entries(pageFiles)) {
		// don't include pages that have a handler function,
		// the html will be included in each route module instead to import
		if (!Object.keys(serverFiles).includes(pagePath)) {
			const finalPath = path.join(
				process.cwd(),
				path.dirname(filePath),
				"index.html",
			);

			await fs.rename(path.join(process.cwd(), filePath), finalPath);

			const code = await fs.readFile(finalPath, "utf-8");

			const outDir = path.join(dirNames.out.base, dirNames.out.client.base);

			const { kB, gzip } = codeSize(code);

			staticFiles.push({
				path: toPosix(
					`${styleText("dim", outDir + "/")}${styleText("green", path.join(pagePath, "index.html").slice(1))}`,
				),
				kB,
				gzip,
			});
		} else {
			// delete the pages that are included in `routes` module
			await fs.rm(path.join(process.cwd(), filePath), { recursive: true });
		}
	}

	return staticFiles;
};

/**
 * Creates a node server and requests pages for static prerender
 * provided by the user.
 *
 * This server is only used at build time.
 */
const generateStatic = async () => {
	const createApp = (
		await import(
			/* @vite-ignore */
			url.pathToFileURL(
				path.join(
					process.cwd(),
					dirNames.out.base,
					dirNames.out.ssr,
					fileNames.out.entry.app,
				),
			).href
		)
	).createApp;

	const app = (await createApp()) as Hono;

	const routes = (
		await import(
			/* @vite-ignore */
			url.pathToFileURL(
				path.join(
					process.cwd(),
					dirNames.out.base,
					dirNames.out.ssr,
					fileNames.out.entry.routes,
				),
			).href
		)
	).routes as Routes;

	const staticFiles: StaticFile[] = [];

	for (let [routePath, { server: mod }] of Object.entries(routes)) {
		if (mod && routePath !== setup) {
			const { prerender } = mod;
			if (prerender) {
				const generate = async (routePath: string) => {
					const res = await app.request(toPosix(routePath));

					if (res.status === 404) {
						throw new Error(
							`Prerendering failed for path \`${routePath}\` | 404 - not found.`,
						);
					}

					const code = await res.text();

					const outDir = path.join(dirNames.out.base, dirNames.out.client.base);

					const outDirPath = path.join(process.cwd(), `${outDir}${routePath}`);

					await fs.mkdir(outDirPath, { recursive: true });
					await fs.writeFile(`${outDirPath}/index.html`, code, "utf-8");

					const { kB, gzip } = codeSize(code);

					staticFiles.push({
						path: toPosix(
							`${styleText("dim", outDir + "/")}${styleText(
								"green",
								routePath.slice(1) +
									(routePath === "/" || routePath === "" ? "" : "/") +
									"index.html",
							)}`,
						),
						kB,
						gzip,
					});
				};

				if (prerender === true) {
					await generate(routePath);
				} else {
					for (let staticPath of prerender) {
						if (!staticPath.startsWith("/")) {
							throw Error(
								`Prerender path \`${staticPath}\` does not start with \`"/"\`.`,
							);
						}

						if (routePath === "/") {
							routePath = "";
						}

						if (staticPath === "/") {
							staticPath = "";
						}

						await generate(`${routePath}${staticPath}`);
					}
				}
			}
		}
	}

	return staticFiles;
};

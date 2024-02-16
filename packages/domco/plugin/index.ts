// types
import type { PluginOption } from "vite";
import type { Build } from "../types/index.js";

// node
import path from "node:path";
import fs from "node:fs/promises";

// packages
import { JSDOM } from "jsdom";

// util
import { minifyHtml } from "../util/minifyHtml/index.js";
import { findAllPaths } from "../util/findAllPaths/index.js";
import { fileExists } from "../util/fileExists/index.js";
import { transpileImport } from "../util/transpileImport/index.js";
import {
	getParams,
	insertParams,
	trimDynamic,
} from "../util/routeUtils/index.js";

const createDom = (html: string) => {
	return new JSDOM(html);
};

const info = {
	paths: {
		root: "src",
		publicDir: path.join(process.cwd(), "public"),
		outDir: path.join(process.cwd(), "dist"),
	},
	files: {
		index: "index",
		layout: "layout",
		indexBuild: "index.build",
		layoutBuild: "layout.build",
	},
} as const;

const entryPoints = await findAllPaths({
	dirPath: info.paths.root,
	fileName: `${info.files.index}.html`,
	root: info.paths.root,
});

/** Generated routes with params */
const generated: {
	/** files to add at the end of the build */
	add: { fileName: string; source: string }[];

	/** directory to delete at the end of the build */
	delete: string[];
} = { add: [], delete: [] };

export const domco = (): PluginOption => {
	return [
		{
			name: "domco-config",
			config() {
				return {
					appType: "mpa",
					root: info.paths.root,
					publicDir: info.paths.publicDir,
					resolve: {
						alias: [
							{
								find: "$lib",
								replacement: path.resolve("src", "lib"),
							},
						],
					},
					build: {
						outDir: info.paths.outDir,
						emptyOutDir: true,
						rollupOptions: { input: entryPoints },
					},
				};
			},

			configureServer(server) {
				const sendFullReload = () => server.hot.send({ type: "full-reload" });

				server.watcher.add(process.cwd()); // instead of `root`

				server.watcher.on("change", (file) => {
					const fullReload = /(.*)(\.(build.js|build.ts|md|txt|json))$/;
					if (fullReload.test(file)) {
						sendFullReload();
					}
				});

				server.watcher.on("add", sendFullReload);
				server.watcher.on("unlink", sendFullReload);

				server.middlewares.use((req, _, next) => {
					if (!req.url) return next();
					// remove the empty strings since `dynPath` will not have those
					const reqSegments = req.url.split("/").filter((v) => v !== "");

					const actualPaths = Object.keys(entryPoints);

					// ones that have "[" will be dynamic
					const dynPaths = actualPaths.filter((v) => v.includes("["));

					for (const dynPath of dynPaths) {
						const dynSegments = dynPath.split(path.sep);
						if (dynSegments.length === reqSegments.length) {
							// the paths are the same length, try to process
							for (let i = 0; i < reqSegments.length; i++) {
								const reqSegment = reqSegments[i];
								const dynSegment = dynSegments[i];

								if (reqSegment === dynSegment) {
									// segments match, go to next
									continue;
								} else if (dynSegment?.startsWith("[")) {
									// segment is dynamic, correct to the actual
									reqSegments[i] = dynSegment;
									req.url = "/" + reqSegments.join("/");
								} else {
									// segments do not match and are not dynamic, stop checking
									break;
								}
							}
						}
					}

					return next();
				});

				// fixes trailing slash for dev server
				// https://github.com/vitejs/vite/issues/6596
				server.middlewares.use((req, _, next) => {
					if (!req.url) return next();
					const requestURL = new URL(req.url, `http://${req.headers.host}`);
					if (/^\/(?:[^@]+\/)*[^@./]+$/g.test(requestURL.pathname)) {
						req.url += "/";
					}
					return next();
				});
			},
		},

		{
			name: "domco-layout",
			transformIndexHtml: {
				// the layout needs to be applied `order: "pre"` in order for the linked
				// assets to be updated afterwards
				order: "pre",
				handler: async (html, ctx) => {
					const route = path.dirname(ctx.path);
					const routePath = path.resolve(path.join(info.paths.root, route));

					const applyLayout = async (options: {
						routePath: string;
						html: string;
					}) => {
						let { routePath, html } = options;
						const layoutPath = path.resolve(
							routePath,
							`${info.files.layout}.html`,
						);

						if (await fileExists(layoutPath)) {
							// If a layout exists, apply it
							const code = await fs.readFile(layoutPath, "utf-8");
							html = code.replace(/<slot>(.*?)<\/slot>/, html);
						}

						const parentRoutePath = path.dirname(routePath);

						if (
							parentRoutePath.includes(
								path.join(process.cwd(), info.paths.root),
							)
						) {
							// recursively apply layout
							html = await applyLayout({ routePath: parentRoutePath, html });
						}

						return html;
					};

					return await applyLayout({ routePath, html });
				},
			},
		},

		{
			name: "domco-main",
			transformIndexHtml: {
				order: "post",
				handler: async (html, ctx) => {
					const route = path.dirname(ctx.path);
					const routePath = path.resolve(path.join(info.paths.root, route));
					const buildMode = ctx.server?.config.command !== "serve";

					const applyBuild = async (options: {
						buildFilename: string;
						routePath: string;
					}) => {
						let { buildFilename, routePath } = options;
						const parentRoutePath = path.dirname(routePath);
						const buildPathTs = path.resolve(routePath, `${buildFilename}.ts`);
						const buildPathJs = path.resolve(routePath, `${buildFilename}.js`);

						let buildPath = "";

						if (await fileExists(buildPathTs)) {
							buildPath = buildPathTs;
						} else if (await fileExists(buildPathJs)) {
							buildPath = buildPathJs;
						}

						if (buildPath) {
							const { build, params } = await transpileImport<{
								build?: Build;
								params?: Record<string, string>[];
							}>(buildPath);

							if (build) {
								const dom = createDom(html);

								if (buildMode && params) {
									for (const currentParams of params) {
										await build(dom.window, {
											route,
											params: currentParams,
										});
										const url = await insertParams(route, currentParams);
										const fileName = `${url}/index.html`;
										const source = dom.serialize();
										generated.add.push({
											fileName,
											source: await minifyHtml(source),
										});
										generated.delete.push(await trimDynamic(route));
									}
								} else {
									const url = ctx.originalUrl || "";
									await build(dom.window, {
										route,
										params: await getParams(route, url),
									});
									html = dom.serialize();
								}
							}
						}

						if (
							buildFilename === info.files.layoutBuild &&
							parentRoutePath.includes(
								path.join(process.cwd(), info.paths.root),
							)
						) {
							// if layout.build, and in a nested dir
							// run the parent's layout
							html = await applyBuild({
								buildFilename,
								routePath: parentRoutePath,
							});
						}

						return html;
					};

					html = await applyBuild({
						buildFilename: info.files.indexBuild,
						routePath,
					});

					html = await applyBuild({
						buildFilename: info.files.layoutBuild,
						routePath,
					});

					if (buildMode) html = await minifyHtml(html);

					return html;
				},
			},

			async writeBundle() {
				for (const file of generated.add) {
					const { fileName, source } = file;
					const filePath = `${process.cwd()}/dist${fileName}`;
					await fs.mkdir(path.dirname(filePath), { recursive: true });
					await fs.writeFile(filePath, source, "utf-8");
				}

				for (const dir of generated.delete) {
					await fs.rm(`${process.cwd()}/dist${dir}`, {
						recursive: true,
						force: true,
					});
				}
			},
		},
	];
};

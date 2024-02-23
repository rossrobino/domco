// types
import type { PluginOption, ResolvedConfig } from "vite";
import type { Config } from "../types/index.js";

// node
import path from "node:path";
import fs from "node:fs/promises";

// util
import {
	minifyHtml,
	type MinifyHtmlOptions,
} from "../util/minifyHtml/index.js";
import { findAllPaths } from "../util/findAllPaths/index.js";
import { fileExists } from "../util/fileExists/index.js";
import { transpileImport } from "../util/transpileImport/index.js";
import {
	getParams,
	insertParams,
	trimDynamic,
} from "../util/routeUtils/index.js";
import { createDom } from "../util/createDom/index.js";

export const domco = (options?: {
	/**
	 * Change the name of the page configuration file.
	 *
	 * @default "+config"
	 */
	configFileName?: string;

	/** `html-minifier-terser` options. */
	minifyHtmlOptions?: MinifyHtmlOptions;
}): PluginOption => {
	const configFileName = options?.configFileName ?? "+config";
	const minifyHtmlOptions = options?.minifyHtmlOptions ?? {};

	let config: ResolvedConfig;

	/** Set in config hook */
	let entryPoints: Record<string, string>;

	/** Generated routes with params */
	const generated: {
		/** files to add at the end of the build */
		add: { fileName: string; source: string }[];

		/** directory to delete at the end of the build */
		delete: string[];
	} = { add: [], delete: [] };

	return [
		{
			name: "domco-config",
			async config(userConfig) {
				const root = userConfig.root ?? "src";
				const publicDir =
					userConfig.publicDir ?? path.join(process.cwd(), "public");
				const outDir =
					userConfig.build?.outDir ?? path.join(process.cwd(), "dist");

				entryPoints = await findAllPaths({
					dirPath: root,
					fileName: "index.html",
					root,
				});

				return {
					root,
					publicDir,
					appType: "mpa",
					resolve: {
						alias: [
							{
								find: "$lib",
								replacement: path.resolve("src", "lib"),
							},
						],
					},
					build: {
						outDir,
						emptyOutDir: true,
						rollupOptions: { input: entryPoints },
					},
				};
			},

			configResolved(resolvedConfig) {
				config = resolvedConfig;
			},

			configureServer(server) {
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
									req.url = `/${reqSegments.join("/")}/`;
								} else {
									// segments do not match and are not dynamic, stop checking
									break;
								}
							}
						}
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
					const routePath = path.resolve(path.join(config.root, route));

					const applyLayout = async (options: {
						routePath: string;
						html: string;
					}) => {
						let { routePath, html } = options;
						const configPath = path.resolve(routePath, `${configFileName}`);

						const tsPath = `${configPath}.ts`;
						const jsPath = `${configPath}.js`;

						let layout = "";

						if (await fileExists(tsPath)) {
							const { config } = await transpileImport<{ config?: Config }>(
								tsPath,
							);
							if (config?.layout) layout = config.layout;
						} else if (await fileExists(jsPath)) {
							const { config } = await transpileImport<{ config?: Config }>(
								jsPath,
							);
							if (config?.layout) layout = config.layout;
						}

						if (layout) {
							html = layout.replace(/<slot>(.*?)<\/slot>/, html);
						}

						const parentRoutePath = path.dirname(routePath);

						if (parentRoutePath.includes(config.root)) {
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
					let route = path.dirname(ctx.path);

					// makes it easier to compare with anchor.href since they end with slash
					if (!route.endsWith("/")) route += "/";

					const routePath = path.resolve(path.join(config.root, route));
					const buildMode = config.command !== "serve";

					const applyBuild = async (options: {
						layout?: boolean;
						routePath: string;
					}) => {
						let { layout, routePath } = options;
						const parentRoutePath = path.dirname(routePath);
						const configPathTs = path.resolve(
							routePath,
							`${configFileName}.ts`,
						);
						const configPathJs = path.resolve(
							routePath,
							`${configFileName}.js`,
						);

						let configPath = "";

						if (await fileExists(configPathTs)) {
							configPath = configPathTs;
						} else if (await fileExists(configPathJs)) {
							configPath = configPathJs;
						}

						if (configPath) {
							const { config } = await transpileImport<{
								config?: Config;
							}>(configPath);

							let { build, layoutBuild, params } = config ?? {};

							if (layout && layoutBuild) {
								build = layoutBuild;
							} else if (layout) {
								// if layout and no layout build
								// this prevents it from running `build` twice
								build = undefined;
							}

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
											source: await minifyHtml(source, minifyHtmlOptions),
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

						if (layout && parentRoutePath.includes(config.root)) {
							// if layout.build, and in a nested dir
							// run the parent's layout
							await applyBuild({
								layout,
								routePath: parentRoutePath,
							});
						}
					};

					await applyBuild({
						routePath,
					});

					await applyBuild({
						routePath,
						layout: true,
					});

					if (buildMode) html = await minifyHtml(html, minifyHtmlOptions);

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

				// remove placeholders - pages with [brackets] used to generate
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

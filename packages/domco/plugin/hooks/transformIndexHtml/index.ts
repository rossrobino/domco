import path from "node:path";
import fs from "node:fs/promises";
import { parseHTML } from "linkedom";
import type { IndexHtmlTransform, IndexHtmlTransformContext } from "vite";
import type { Build, Generated } from "../../../types/index.js";
import { info } from "../../../info/index.js";
import { fileExists } from "../../../util/fileExists/index.js";
import { transpileImport } from "../../../util/transpileImport/index.js";
import { getParams, insertParams } from "../../../util/routeParams/index.js";

export const transformIndexHtml = async () => {
	const indexHtmlTransformPre = () => {
		const result: IndexHtmlTransform = {
			order: "pre",
			handler: async (html, ctx) => {
				const route = path.dirname(ctx.path);
				const routePath = path.resolve(path.join(info.paths.routes, route));
				html = await applyLayout({ routePath, html });
				return html;
			},
		};
		return result;
	};
	const indexHtmlTransformPost = (generated: Generated) => {
		const result: IndexHtmlTransform = {
			order: "post",
			handler: async (html, ctx) => {
				const route = path.dirname(ctx.path);
				const routePath = path.resolve(path.join(info.paths.routes, route));

				html = await applyBuild({
					buildFilename: info.files.layoutBuild,
					route,
					routePath,
					ctx,
					generated,
					html,
				});

				html = await applyBuild({
					buildFilename: info.files.indexBuild,
					route,
					routePath,
					ctx,
					generated,
					html,
				});

				return html;
			},
		};
		return result;
	};
	return { indexHtmlTransformPre, indexHtmlTransformPost };
};

const applyLayout = async (options: { routePath: string; html: string }) => {
	let { routePath, html } = options;
	const layoutPath = path.resolve(routePath, `${info.files.layout}.html`);

	if (await fileExists(layoutPath)) {
		// If a layout exists, apply it
		const code = await fs.readFile(layoutPath, "utf-8");
		html = code.replace(/<slot>(.*?)<\/slot>/, html);
	}

	const parentRoutePath = path.dirname(routePath);

	if (parentRoutePath.includes(info.paths.routes)) {
		html = await applyLayout({ routePath: parentRoutePath, html });
	}

	return html;
};

const applyBuild = async (options: {
	buildFilename: string;
	route: string;
	routePath: string;
	ctx: IndexHtmlTransformContext;
	generated: Generated;
	html: string;
}) => {
	let { buildFilename, route, routePath, html, ctx, generated } = options;
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
			const buildMode = ctx.server?.config.command !== "serve";
			if (buildMode && params) {
				if (params) {
					for (const currentParams of params) {
						const parseHtmlResult = parseHTML(html);
						const url = await insertParams(route, currentParams);
						await build(parseHtmlResult, {
							route: { id: route, url },
							params: currentParams,
						});
						const fileName = `${url}/index.html`;
						const source = parseHtmlResult.document.toString();
						generated.add.push({
							fileName,
							source,
						});
						generated.delete = route;
					}
				}
			} else {
				const url = ctx.originalUrl || "";
				const parseHtmlResult = parseHTML(html);
				await build(parseHtmlResult, {
					route: { id: route, url },
					params: await getParams(route, url),
				});
				html = parseHtmlResult.document.toString();
			}
		}
	}

	if (
		buildFilename === info.files.layoutBuild &&
		parentRoutePath.includes(info.paths.routes)
	) {
		// if layout.build, and in a nested dir
		// run the parent's layout
		html = await applyBuild({
			buildFilename,
			route,
			routePath: parentRoutePath,
			ctx,
			generated,
			html,
		});
	}

	return html;
};

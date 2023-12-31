import path from "node:path";
import fs from "node:fs/promises";
import { parseHTML } from "linkedom";
import type { IndexHtmlTransform, IndexHtmlTransformContext } from "vite";
import type { Build, Generated } from "../../../types/index.js";
import { info } from "../../../info/index.js";
import { fileExists } from "../../../util/fileExists/index.js";
import { transpileImport } from "../../../util/transpileImport/index.js";
import {
	getParams,
	insertParams,
	trimDynamic,
} from "../../../util/routeUtils/index.js";
import { minifyHtml } from "../../../util/minifyHtml/index.js";

export const transformIndexHtml = async () => {
	const layoutTransform = () => {
		// the layout needs to be applied `order: "pre"` in order for the linked
		// assets to be updated afterwards
		const result: IndexHtmlTransform = {
			order: "pre",
			handler: async (html, ctx) => {
				const route = path.dirname(ctx.path);
				const routePath = path.resolve(path.join(info.paths.root, route));
				html = await applyLayout({ routePath, html });
				return html;
			},
		};
		return result;
	};
	const htmlParseTransform = (options: { generated: Generated }) => {
		const { generated } = options;
		const result: IndexHtmlTransform = {
			order: "post",
			handler: async (html, ctx) => {
				const route = path.dirname(ctx.path);
				const routePath = path.resolve(path.join(info.paths.root, route));
				const buildMode = ctx.server?.config.command !== "serve";

				html = await applyBuild({
					buildFilename: info.files.indexBuild,
					route,
					routePath,
					ctx,
					generated,
					html,
					buildMode,
				});

				html = await applyBuild({
					buildFilename: info.files.layoutBuild,
					route,
					routePath,
					ctx,
					generated,
					html,
					buildMode,
				});

				if (buildMode) html = await minifyHtml(html);

				return html;
			},
		};
		return result;
	};
	return { layoutTransform, htmlParseTransform };
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

	if (parentRoutePath.includes(path.join(process.cwd(), info.paths.root))) {
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
	buildMode: boolean;
}) => {
	let { buildFilename, route, routePath, html, ctx, generated, buildMode } =
		options;
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
			if (buildMode && params) {
				for (const currentParams of params) {
					const parseHtmlResult = parseHTML(html);
					await build(parseHtmlResult, {
						route,
						params: currentParams,
					});
					const url = await insertParams(route, currentParams);
					const fileName = `${url}/index.html`;
					const source = parseHtmlResult.document.toString();
					generated.add.push({
						fileName,
						source: await minifyHtml(source),
					});
					generated.delete.push(await trimDynamic(route));
				}
			} else {
				const url = ctx.originalUrl || "";
				const parseHtmlResult = parseHTML(html);
				await build(parseHtmlResult, {
					route,
					params: await getParams(route, url),
				});
				html = parseHtmlResult.document.toString();
			}
		}
	}

	if (
		buildFilename === info.files.layoutBuild &&
		parentRoutePath.includes(path.join(process.cwd(), info.paths.root))
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
			buildMode,
		});
	}

	return html;
};

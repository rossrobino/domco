import path from "node:path";
import { parseHTML } from "linkedom";
import type { IndexHtmlTransform } from "vite";
import type { Build } from "../../types";
import { info } from "../../info";
import { fileExists } from "../../util/fileExists";
import { transpileImport } from "../../util/transpileImport";
import fs from "node:fs/promises";

export const transformIndexHtml: IndexHtmlTransform = {
	order: "pre",
	handler: async (html, ctx) => {
		const route = path.dirname(ctx.path);
		const routePath = path.resolve(path.join(info.paths.routes, route));

		html = await applyLayout({ routePath, html });

		html = await applyBuild({
			buildFilename: info.files.layoutBuild,
			route,
			routePath,
			html,
		});

		html = await applyBuild({
			buildFilename: info.files.indexBuild,
			route,
			routePath,
			html,
		});

		return html;
	},
};

const applyLayout = async (options: { routePath: string; html: string }) => {
	let { routePath, html } = options;
	const layoutPath = path.resolve(routePath, "layout.html");

	if (await fileExists(layoutPath)) {
		// If a layout exists, apply it
		const code = await fs.readFile(layoutPath, "utf-8");
		html = code.split("<slot></slot>").join(html);
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
	html: string;
}) => {
	let { buildFilename, route, routePath, html } = options;
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
		const { build } = await transpileImport<{ build: Build }>(buildPath);

		const parseHtmlResult = parseHTML(html, "text/html");

		const result = await build(parseHtmlResult, { route });

		html = result.document.toString();
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
			html,
		});
	}

	return html;
};

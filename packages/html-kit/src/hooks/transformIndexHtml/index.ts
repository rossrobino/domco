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

		// layout
		// I need this to work for nested layouts as well. The nested layout should be applied first, and then all of the other layouts that exists above it
		html = await applyLayout(routePath, html);

		// index.build
		const indexBuildPathTs = path.resolve(
			routePath,
			`${info.files.indexBuild}.ts`,
		);
		const indexBuildPathJs = path.resolve(
			routePath,
			`${info.files.indexBuild}.js`,
		);

		let indexBuildPath = "";
		if (await fileExists(indexBuildPathTs)) {
			indexBuildPath = indexBuildPathTs;
		} else if (await fileExists(indexBuildPathJs)) {
			indexBuildPath = indexBuildPathJs;
		} else {
			return html;
		}

		const { build } = await transpileImport<{ build: Build }>(indexBuildPath);

		const parseHtmlResult = parseHTML(html, "text/html");

		const result = await build(parseHtmlResult, { route });

		return result.document.toString();
	},
};

const applyLayout = async (routePath: string, html: string) => {
	const layoutPath = path.resolve(routePath, "layout.html");

	if (await fileExists(layoutPath)) {
		// If a layout exists, apply it
		const code = await fs.readFile(layoutPath, "utf-8");
		html = code.split("<slot></slot>").join(html);
	}

	const parentRoutePath = path.dirname(routePath);

	if (parentRoutePath.includes(info.paths.routes)) {
		html = await applyLayout(parentRoutePath, html);
	}

	return html;
};

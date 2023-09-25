import path from "node:path";
import { parseHTML } from "linkedom";
import type { IndexHtmlTransform } from "vite";
import type { Build } from "../../types";
import { info } from "../../info";
import { fileExists } from "../../util/fileExists";
import { transpileImport } from "../../util/transpileImport";

export const transformIndexHtml: IndexHtmlTransform = {
	order: "post",
	handler: async (html, ctx) => {
		const route = path.dirname(ctx.path);
		const routePath = path.resolve(path.join(info.paths.routes, route));

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

		const { build } = await transpileImport<{ build: Build }>(buildFilePath);

		const parseHtmlResult = parseHTML(html, "text/html");

		const result = await build(parseHtmlResult, { route });

		return result.document.toString();
	},
};

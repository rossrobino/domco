import type { PluginOption } from "vite";
import { configureServer } from "./hooks/configureServer/index.js";
import { config } from "./hooks/config/index.js";
import { transformIndexHtml } from "./hooks/transformIndexHtml/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Generated } from "../types/index.js";

const generated: Generated = { add: [], delete: [] };

const { setConfig, entryPoints } = await config();
const { indexHtmlTransformPost, indexHtmlTransformPre } =
	await transformIndexHtml();

export const domco = (): PluginOption => {
	return [
		{
			name: "domco-pre",
			transformIndexHtml: indexHtmlTransformPre(),
		},
		{
			name: "domco",
			configureServer: configureServer({ entryPoints }),
			config: setConfig(),
			transformIndexHtml: indexHtmlTransformPost(generated),
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

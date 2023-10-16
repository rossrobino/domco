import type { PluginOption } from "vite";
import { configureServer } from "./hooks/configureServer/index.js";
import { config } from "./hooks/config/index.js";
import { transformIndexHtml } from "./hooks/transformIndexHtml/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Generated } from "../types/index.js";

const generated: Generated = { add: [], delete: [] };

const { setConfig, entryPoints } = await config();
const { htmlParseTransform, layoutTransform } = await transformIndexHtml();

export const domco = (): PluginOption => {
	return [
		{
			name: "domco-layoutTransform",
			transformIndexHtml: layoutTransform(),
		},
		{
			name: "domco-main",
			configureServer: configureServer({ entryPoints }),
			config: setConfig(),
			transformIndexHtml: htmlParseTransform(generated),
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

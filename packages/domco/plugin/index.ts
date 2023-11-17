import type { PluginOption } from "vite";
import { configureServer } from "./hooks/configureServer/index.js";
import { config } from "./hooks/config/index.js";
import { transformIndexHtml } from "./hooks/transformIndexHtml/index.js";
import type { Generated } from "../types/index.js";
import { writeBundle } from "./hooks/writeBundle/index.js";

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
			transformIndexHtml: htmlParseTransform({ generated }),
			writeBundle: writeBundle({ generated }),
		},
	];
};

import type { PluginOption } from "vite";
import { configureServer } from "./hooks/configureServer/index.js";
import { config } from "./hooks/config/index.js";
import { transformIndexHtml } from "./hooks/transformIndexHtml/index.js";

export const domco = (): PluginOption => {
	return {
		name: "domco",
		configureServer: configureServer(),
		config: config(),
		transformIndexHtml: transformIndexHtml(),
	};
};

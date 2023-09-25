import type { PluginOption } from "vite";
import { config } from "./config/index.js";
import { transformIndexHtml } from "./transformIndexHtml/index.js";

export const htmlKit = (): PluginOption => {
	return {
		name: "html-kit",
		config,
		transformIndexHtml,
	};
};

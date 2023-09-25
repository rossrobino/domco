import type { PluginOption } from "vite";
import { config } from "./config";
import { transformIndexHtml } from "./transformIndexHtml";
import { configureServer } from "./configureServer";

export const htmlKit = (): PluginOption => {
	return {
		name: "html-kit",
		configureServer,
		config,
		transformIndexHtml,
	};
};

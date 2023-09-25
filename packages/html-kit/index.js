import { config } from "./config/index.js";
import { transformIndexHtml } from "./transformIndexHtml/index.js";

/**
 * @returns {import("vite").PluginOption}
 */
export const htmlKit = () => {
	return {
		name: "html-kit",
		config,
		transformIndexHtml,
	};
};

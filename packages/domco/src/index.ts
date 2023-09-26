import type { PluginOption } from "vite";
import { config } from "./hooks/config";
import { transformIndexHtml } from "./hooks/transformIndexHtml";
import { configureServer } from "./hooks/configureServer";
import type { Build, BuildContext, BuildResult } from "./types";

const domco = (): PluginOption => {
	return {
		name: "domco",
		configureServer,
		config,
		transformIndexHtml,
	};
};

export { domco, type Build, type BuildContext, type BuildResult };

import type { PluginOption } from "vite";
import { config } from "./hooks/config";
import { transformIndexHtml } from "./hooks/transformIndexHtml";
import { configureServer } from "./hooks/configureServer";
import type { Build, BuildContext, BuildResult } from "./types";

const htmlKit = (): PluginOption => {
	return {
		name: "html-kit",
		configureServer,
		config,
		transformIndexHtml,
	};
};

export { htmlKit, type Build, type BuildContext, type BuildResult };

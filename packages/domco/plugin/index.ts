import type { PluginOption } from "vite";
import { configureServer } from "./hooks/configureServer/index.js";
import { config } from "./hooks/config/index.js";
import { transformIndexHtml } from "./hooks/transformIndexHtml/index.js";

const { setConfig, entryPoints } = await config();
const { indexHtmlTransform } = await transformIndexHtml();

export const domco = (): PluginOption => {
	return {
		name: "domco",
		configureServer: configureServer({ entryPoints }),
		config: setConfig(),
		transformIndexHtml: indexHtmlTransform(),
		generateBundle(option, bundle) {
			this.emitFile({
				type: "asset",
				fileName: "hi/index.html",
				source: `
		<!DOCTYPE html>
		<html>
		<head>
		  <meta charset="UTF-8">
		  <title>Title</title>
		 </head>
		<body>
		  <script src="/style.postcss" type="module"></script>
		</body>
		</html>`,
			});
		},
	};
};

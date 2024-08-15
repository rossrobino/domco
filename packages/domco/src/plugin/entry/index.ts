import type { DomcoConfig } from "../../types/public/index.js";
import type { Plugin } from "vite";

/** ID of the entry point that exports `createApp`. */
export const appId = "domco:app-entry";
export const nodeId = "domco:node-entry";

export const entryPlugin = (domcoConfig: DomcoConfig): Plugin => {
	const resolvedAppId = "\0" + appId;
	const resolvedNodeId = "\0" + nodeId;

	return {
		name: "domco:entry",

		resolveId(id) {
			if (id === appId) {
				return resolvedAppId;
			} else if (id === nodeId) {
				return resolvedNodeId;
			}
		},

		async load(id) {
			if (id == resolvedAppId) {
				// this entry provides an export of the built app
				// user can create a separate module and import createApp
				// to build their app.

				return `export { createApp } from "domco/app";`;
			} else if (id === resolvedNodeId) {
				// the node entry provides a standard way to build the project
				// and preview it on their local machine.

				return `import { createApp } from "${appId}";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = createApp({ serveStatic });

serve({
	fetch: app.fetch,
	port: process.env.PORT || ${domcoConfig.port?.prod}
});
`;
			}
		},
	};
};

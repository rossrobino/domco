import type { AdapterBuilder } from "../../types/public/index.js";

/**
 * Creates a NodeJS build using `@hono/node-server`.
 *
 * @returns NodeJS domco adapter.
 *
 * @example
 *
 * ```ts
 * import { domco } from "domco";
 * import { adapter } from "domco/adapter/node";
 * import { defineConfig } from "vite";
 *
 * export default defineConfig({
 * 	plugins: [
 * 		domco({
 * 			adapter: adapter(),
 * 		}),
 * 	],
 * });
 * ```
 */
export const adapter: AdapterBuilder = () => {
	return {
		name: "node",

		message: "run `node dist/server/main.js` to start your server",

		entry: ({ appId, port }) => {
			return `import { createApp } from "${appId}";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import process from "node:process";

const app = createApp({ serveStatic });

serve({
	fetch: app.fetch,
	port: process.env.PORT || ${port}
});
`;
		},
	};
};

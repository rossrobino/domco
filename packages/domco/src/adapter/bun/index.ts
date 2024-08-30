import type { AdapterBuilder } from "../../types/public/index.js";

/**
 * Creates a Bun build using the [HTTP server](https://bun.sh/docs/api/http).
 *
 * @returns Bun domco adapter.
 *
 * @example
 *
 * ```ts
 * import { domco } from "domco";
 * import { adapter } from "domco/adapter/bun";
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
		name: "bun",

		message: "run `bun dist/server/main.js` to start your server",

		entry: ({ appId, port }) => {
			return `import { createApp } from "${appId}";
import { serveStatic } from "hono/bun";

const app = createApp({ serveStatic });

Bun.serve({
	fetch: app.fetch,
	port: ${port}
});
`;
		},
	};
};

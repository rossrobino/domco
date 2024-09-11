import { dirNames } from "../../constants/index.js";
import type { AdapterBuilder } from "../../types/public/index.js";

/**
 * Creates a Deno Deploy build.
 *
 * @param options adapter options
 * @returns Deno domco adapter.
 *
 * @example
 *
 * ```ts
 * import { domco } from "domco";
 * import { adapter } from "domco/adapter/deno";
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
export const adapter: AdapterBuilder = async () => {
	return {
		name: "deno",
		target: "webworker",
		noExternal: true,
		message:
			"created Deno build dist/\n\nrun `deno run -A dist/server/main.js` to start the server.",

		entry: ({ appId }) => {
			return {
				id: "main",
				code: `
					import { createApp } from "${appId}";
					import { serveDir } from "https://jsr.io/@std/http/1.0.5/file_server.ts";

					const getStatic = async (req) => {
						return serveDir(req, {
							fsRoot: "./${dirNames.out.base}/${dirNames.out.client.base}",
							quiet: true,
						});
					};

					const serveStatic = async (c, next) => {
						const res = await getStatic(c.req.raw);

						if (res.ok) return res;

						if (res.status === 301) {
							const location = res.headers.get("location");
							if (location) {
								const redirect = await getStatic(new Request(location));
								if (redirect.ok) return redirect;
							}
						}

						await next();
					};
					
					const app = createApp({
						middleware: [
							{
								path: "/*",
								handler: serveStatic,
							},
						],
					});
					
					Deno.serve(app.fetch);
				`,
			};
		},
	};
};

import type { AdapterBuilder } from "domco";
import { dirNames } from "domco/constants";

/**
 * Creates a Deno Deploy build.
 *
 * @param options adapter options
 * @returns Deno domco adapter.
 *
 * @example
 *
 * ```ts
 * import { adapter } from "@domcojs/deno";
 * import { domco } from "domco";
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

		entry: ({ funcId }) => {
			return {
				id: "main",

				/**
				 * Need to first serve static, deno's file server will redirect if there
				 * is a directory with the pathname, so that needs to be tried first before
				 * falling back to the handler.
				 */
				code: `
					import { handler } from "${funcId}";
					import { serveDir } from "https://jsr.io/@std/http/1.0.7/file_server.ts";

					const getStatic = (req) => {
						return serveDir(req, {
							fsRoot: "./${dirNames.out.base}/${dirNames.out.client.base}",
							quiet: true,
						});
					};

					const denoHandler = async (req) => {
						const res = await getStatic(req);

						if (res.ok) return res;

						if (res.status === 301) {
							const location = res.headers.get("location");
							if (location) {
								const redirect = await getStatic(new Request(location));
								if (redirect.ok) return redirect;
							}
						}

						return handler(req);
					};
					
					Deno.serve(denoHandler);
				`,
			};
		},
	};
};

import { createAppDev } from "../../dev/index.js";
import { fileNames } from "../../constants/index.js";
import { getRequestListener } from "@hono/node-server";
import type { Plugin } from "vite";

export const configureServerPlugin = (): Plugin => {
	return {
		name: "domco:configure-server",
		apply: "serve",
		// only apply in dev
		transform(code, id) {
			// inject vite client to client entries, in case the script is added
			// without adding an html file. This is a easier than injecting a tag
			// into the html response, but will only work if a script is added.
			if (id.includes(fileNames.client)) {
				return {
					// put it at the end to not mess up line numbers
					code: `${code}\n\n// dev\nimport "/@vite/client";`,
				};
			}
		},
		async configureServer(devServer) {
			const sendFullReload = () => devServer.hot.send({ type: "full-reload" });

			const listener = (filePath: string) => {
				if (filePath.endsWith(fileNames.page)) {
					sendFullReload();
				}
			};

			devServer.watcher.on("add", listener);
			devServer.watcher.on("unlink", listener);
			devServer.watcher.on("change", listener);

			return async () => {
				// POST MIDDLEWARE
				const app = createAppDev({ devServer });

				devServer.middlewares.use(async (req, res, next) => {
					getRequestListener(
						// This code is copied from
						// https://github.com/honojs/vite-plugins/blob/main/packages/dev-server/src/dev-server.ts
						async (request) => {
							const response = await app.fetch(request);

							if (!(response instanceof Response)) throw response;

							return response;
						},
						{
							overrideGlobalObjects: false,
							errorHandler: (e) => {
								let error: Error;

								if (e instanceof Error) {
									error = e;
									devServer.ssrFixStacktrace(error);
								} else if (typeof e === "string") {
									error = new Error(
										`The response is not an instance of "Response".\n\nServer returned:\n\n${e}`,
									);
								} else {
									error = new Error(`Unknown error: ${e}`);
								}

								next(error);
							},
						},
					)(req, res);
				});
			};
		},
	};
};

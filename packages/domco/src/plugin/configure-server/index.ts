import { createAppDev } from "../../app/dev/index.js";
import type { createApp as createAppType } from "../../app/index.js";
import { dirNames, fileNames } from "../../constants/index.js";
import { createRequestListener } from "../../node/request-listener/index.js";
import { serveStatic } from "../../node/serve-static/index.js";
import type { Adapter, CreateAppOptions } from "../../types/public/index.js";
import path from "node:path";
import process from "node:process";
import url from "node:url";
import type { Plugin } from "vite";

export const configureServerPlugin = (adapter?: Adapter): Plugin => {
	return {
		name: "domco:configure-server",
		apply: "serve",

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
				const app = createAppDev({
					devServer,
					middleware: adapter?.devMiddleware,
				});

				devServer.middlewares.use(async (req, res, next) => {
					createRequestListener(
						// Copied from https://github.com/honojs/vite-plugins/blob/main/packages/dev-server/src/dev-server.ts
						async (request) => {
							const response = await app.fetch(request);

							if (!(response instanceof Response)) throw response;

							return response;
						},
						{
							onError: (e) => {
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

		async configurePreviewServer(previewServer) {
			// import built app from dist
			const createApp = (
				await import(
					url.pathToFileURL(
						path.join(
							process.cwd(),
							dirNames.out.base,
							dirNames.out.ssr,
							fileNames.out.entry.app,
						),
					).href
				)
			).createApp as typeof createAppType;

			const middleware: CreateAppOptions["middleware"] = [
				{ path: "/*", handler: serveStatic },
			];

			if (adapter?.previewMiddleware) {
				middleware.push(...adapter.previewMiddleware);
			}

			const app = createApp({ middleware });

			previewServer.middlewares.use(createRequestListener(app.fetch));
		},
	};
};

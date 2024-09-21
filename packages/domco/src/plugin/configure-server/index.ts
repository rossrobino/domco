import { dirNames, fileNames } from "../../constants/index.js";
import { nodeListener } from "../../listener/index.js";
import type { Adapter, FuncModule } from "../../types/index.js";
import { findFiles } from "../../util/fs/index.js";
import path from "node:path";
import process from "node:process";
import url from "node:url";
import type { Plugin } from "vite";

/**
 * Configures the dev and preview server for SSR.
 *
 * @param adapter
 * @returns Vite plugin
 */
export const configureServerPlugin = (adapter?: Adapter): Plugin => {
	return {
		name: "domco:configure-server",
		apply: "serve",

		transform(code, id) {
			// inject vite client to client entries, in case the script is added
			// without adding an html file. This is a easier than injecting a tag
			// into the html response, but will only work if a script is added.
			if (id.includes(fileNames.script)) {
				return {
					// put it at the end to not mess up line numbers
					code: `${code}\n\n// dev\nimport "/@vite/client";`,
				};
			}
		},

		async configureServer(devServer) {
			return async () => {
				for (const mw of adapter?.devMiddleware ?? []) {
					devServer.middlewares.use(mw);
				}

				devServer.middlewares.use(async (req, res, next) => {
					nodeListener(
						// Copied from https://github.com/honojs/vite-plugins/blob/main/packages/dev-server/src/dev-server.ts
						async (request) => {
							const { handler } = (await devServer.ssrLoadModule(
								path.join(
									process.cwd(),
									dirNames.src.base,
									dirNames.src.server,
									fileNames.func,
								),
							)) as FuncModule;

							const response = await handler(request);

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
			const serveDir = path.join(dirNames.out.base, dirNames.out.client.base);

			const htmlFiles = await findFiles({
				dir: serveDir,
				checkEndings: ["index.html"],
			});

			// Rewrites static routes to HTML urls so Vite will serve the static file.
			previewServer.middlewares.use(async (req, res, next) => {
				let pathName = req.url;

				if (pathName && req.method === "GET") {
					let trailingSlash = false;

					if (pathName !== "/" && pathName.endsWith("/")) {
						// Remove the trailing slash on the temporary pathName since htmlFiles keys do not have it.
						pathName = pathName.slice(0, -1);
						trailingSlash = true;
					}

					if (pathName in htmlFiles) {
						if (trailingSlash) {
							// redirect to path without trailing slash
							res.writeHead(307, { location: pathName });
							return res.end();
						}

						// Rewrite the url so Vite serves the HTML file.
						req.url = htmlFiles[pathName]?.slice(`/${serveDir}`.length);
					}
				}

				return next();
			});

			return async () => {
				// This must be post middleware or serve static will not work.

				for (const mw of adapter?.previewMiddleware ?? []) {
					previewServer.middlewares.use(mw);
				}

				// import from dist
				const { handler } = (await import(
					url.pathToFileURL(
						path.join(
							process.cwd(),
							dirNames.out.base,
							dirNames.out.ssr,
							fileNames.out.entry.func,
						),
					).href
				)) as FuncModule;

				previewServer.middlewares.use(nodeListener(handler));
			};
		},
	};
};

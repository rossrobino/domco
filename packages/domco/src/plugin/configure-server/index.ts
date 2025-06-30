import { dirNames, fileNames } from "../../constants/index.js";
import { nodeListener } from "../../listener/index.js";
import type { Adapter } from "../../types/index.js";
import { findFiles } from "../../util/fs/index.js";
import { validateEntry } from "../../util/validate-entry/index.js";
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

		async configureServer(devServer) {
			return async () => {
				for (const mw of adapter?.devMiddleware ?? []) {
					devServer.middlewares.use(mw);
				}

				devServer.middlewares.use(async (req, res, next) => {
					nodeListener(
						// Copied from https://github.com/honojs/vite-plugins/blob/main/packages/dev-server/src/dev-server.ts
						async (request) => {
							const app = validateEntry(
								await devServer.ssrLoadModule(
									path.join(
										process.cwd(),
										dirNames.src.base,
										dirNames.src.server,
										fileNames.app,
									),
								),
							);

							const res = await app.fetch(request);

							if (!(res instanceof Response)) throw res;

							if (res.headers.get("content-type")?.startsWith("text/html")) {
								return injectViteClient(res);
							}

							return res;
						},
						{
							onError(e) {
								let error: Error;

								if (e instanceof Error) {
									error = e;
									devServer.ssrFixStacktrace(error);
								} else {
									error = new Error(
										`The response is not an instance of \`Response\`.\n\nServer returned:\n\n${e}`,
									);
								}

								next(error);
							},
							onStreamError(error) {
								if (error instanceof Error) devServer.ssrFixStacktrace(error);

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

			// This must be post middleware or serve static will not work.
			return async () => {
				for (const mw of adapter?.previewMiddleware ?? []) {
					previewServer.middlewares.use(mw);
				}

				// import from dist
				const app = validateEntry(
					await import(
						url.pathToFileURL(
							path.join(
								process.cwd(),
								dirNames.out.base,
								dirNames.out.ssr,
								fileNames.out.entry.app,
							),
						).href
					),
				);

				previewServer.middlewares.use(nodeListener(app.fetch));
			};
		},
	};
};

const viteClient = '<script type="module" src="/@vite/client"></script>';
const encoder = new TextEncoder();

/**
 * Injects the vite client script at the end of the response body
 * for refresh during development.
 *
 * @param res Original response
 * @returns Modified response
 */
const injectViteClient = (res: Response) => {
	if (!res.body) return res;

	const headers = new Headers(res.headers);
	headers.delete("Content-Length");

	const reader = res.body.getReader();

	return new Response(
		new ReadableStream<Uint8Array>({
			async pull(c) {
				const result = await reader.read();

				if (result.done) {
					c.enqueue(encoder.encode(viteClient));
					return c.close();
				}

				c.enqueue(result.value);
			},
			cancel() {
				return reader.cancel();
			},
		}),
		{ headers, status: res.status },
	);
};

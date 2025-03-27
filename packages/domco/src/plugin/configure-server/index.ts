import { dirNames, fileNames } from "../../constants/index.js";
import { nodeListener } from "../../listener/index.js";
import type { Adapter, FuncModule } from "../../types/index.js";
import { findFiles } from "../../util/fs/index.js";
import { funcExports } from "../../util/func-exports/index.js";
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
							const mod: FuncModule = await devServer.ssrLoadModule(
								path.join(
									process.cwd(),
									dirNames.src.base,
									dirNames.src.server,
									fileNames.func,
								),
							);

							const exports = funcExports(mod);

							const res = await exports.fetch(request);

							if (!(res instanceof Response)) throw res;

							if (res.headers.get("content-type")?.startsWith("text/html")) {
								return injectViteClient(res);
							}

							return res;
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
				const mod = (await import(
					url.pathToFileURL(
						path.join(
							process.cwd(),
							dirNames.out.base,
							dirNames.out.ssr,
							fileNames.out.entry.func,
						),
					).href
				)) as FuncModule;

				const exports = funcExports(mod);

				previewServer.middlewares.use(nodeListener(exports.fetch));
			};
		},
	};
};

/**
 * Injects the vite client script into the response body for refresh in dev.
 *
 * @param res
 * @returns the modified response
 */
const injectViteClient = (res: Response) => {
	if (!res.body) return res;

	const viteClient = new TextEncoder().encode(
		'<script type="module" src="/@vite/client"></script>',
	);

	const reader = res.body.getReader();

	const stream = new ReadableStream<Uint8Array<ArrayBufferLike>>({
		async start(controller) {
			controller.enqueue(viteClient);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				controller.enqueue(value);
			}

			controller.close();
		},
	});

	const headers = new Headers(res.headers);
	headers.delete("Content-Length");

	return new Response(stream, { headers, status: res.status });
};

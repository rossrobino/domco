import { dirNames, fileNames } from "../../constants/index.js";
import { getChunk } from "../../util/manifest/index.js";
import { resolveId } from "../../util/resolve-id/index.js";
import type { Chunk } from "client:page";
import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Creates the `client:page` virtual module.
 *
 * @returns Vite plugin
 */
export const pagePlugin = (): Plugin => {
	const pageId = "client:page";
	const resolvedPageId = resolveId(pageId);

	let devServer: ViteDevServer;

	/** Watched page filePaths. */
	const watched = new Set<string>();

	return {
		name: `domco:${pageId}`,

		configureServer(server) {
			devServer = server;
		},

		resolveId: {
			filter: { id: new RegExp(`^${pageId}`) },
			handler(id) {
				// don't return the resolved id here, needs to be the full path.
				return resolveId(id);
			},
		},

		load: {
			filter: { id: new RegExp(`^${resolvedPageId}`) },
			async handler(id, _options) {
				let pathName = id.slice(resolvedPageId.length);

				// remove trailing slash
				if (pathName.endsWith("/")) pathName = pathName.slice(0, -1);
				if (!pathName) pathName = "/";

				let chunk: Chunk;
				let html: string;

				if (devServer) {
					// read from src and transform
					const src = path.join(dirNames.src.client, pathName, fileNames.page);

					chunk = {
						tags: "",
						src: {
							// src relative to src/
							src, // this is the html file in prod
							file: "", // this is a js file in prod, so empty here instead of the html
							assets: [],
							module: [],
							preload: [],
							style: [],
							dynamic: [],
						},
					};

					// add base
					const filePath = path.join(dirNames.src.base, src);

					if (!watched.has(filePath)) {
						// add listeners if they are not already there
						watched.add(filePath);

						devServer.watcher.on("all", (_event, fp) => {
							if (fp.endsWith(filePath)) {
								const mod = devServer.moduleGraph.getModuleById(id);
								if (mod) devServer.reloadModule(mod);
							}
						});
					}

					try {
						html = await fs.readFile(filePath, "utf-8");
						html = await devServer.transformIndexHtml(pathName, html);
					} catch (error) {
						html = "";

						if (error instanceof Error) {
							this.warn(error.message);
						} else {
							this.warn(`Could not read and transform \`${filePath}\``);
						}
					}
				} else {
					chunk = await getChunk({ pathName, error: this.error, page: true });

					// read from client output
					html = await fs.readFile(
						path.join(
							dirNames.out.base,
							dirNames.out.client.base,
							dirNames.src.client,
							pathName,
							fileNames.page,
						),
						"utf-8",
					);
				}

				return (
					`export const html = ${JSON.stringify(html)};\n` +
					`export const chunk = ${JSON.stringify(chunk)}\n`
				);
			},
		},
	};
};

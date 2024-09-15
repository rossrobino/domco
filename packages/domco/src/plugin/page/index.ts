import { dirNames, fileNames } from "../../constants/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

export const pagePlugin = (): Plugin => {
	const pageId = "client:page";

	let devServer: ViteDevServer;

	/** watched page filePaths */
	const watched = new Set<string>();

	return {
		name: `domco:${pageId}`,

		configureServer(server) {
			devServer = server;
		},

		resolveId(id) {
			if (id.startsWith(pageId)) {
				return "\0" + id;
			}
		},

		async load(id, _options) {
			const beginning = `\0${pageId}`;

			if (id.startsWith(beginning)) {
				const pathName = id.slice(beginning.length);

				let html: string;

				if (devServer) {
					// read from src and transform
					const filePath = path.join(
						dirNames.src.base,
						dirNames.src.client,
						pathName,
						fileNames.page,
					);

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
					// read from client output
					const filePath = path.join(
						dirNames.out.base,
						dirNames.out.client.base,
						dirNames.src.client,
						pathName,
						fileNames.page,
					);

					html = await fs.readFile(filePath, "utf-8");
				}

				return `export default ${JSON.stringify(html)};`;
			}
		},
	};
};

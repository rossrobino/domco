import { dirNames, fileNames } from "../../constants/index.js";
import { findFile, toPosix } from "../../util/fs/index.js";
import { getChunk, getModule } from "../../util/manifest/index.js";
import { resolveId } from "../../util/resolve-id/index.js";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Creates the `client:style` virtual module.
 *
 * @returns Vite plugin
 */
export const stylePlugin = (): Plugin => {
	const styleId = "client:style";
	const resolvedScriptId = resolveId(styleId);

	let prod: boolean | undefined;

	return {
		name: `domco:${styleId}`,
		config(_config, env) {
			prod = env.mode === "production";
		},

		resolveId: {
			filter: { id: new RegExp(`^${styleId}`) },
			handler(id) {
				// don't return the resolved id here, needs to be the full path.
				return resolveId(id);
			},
		},

		load: {
			filter: { id: new RegExp(`^${resolvedScriptId}`) },
			async handler(id) {
				let pathName = id.slice(resolvedScriptId.length);

				// remove trailing slash
				if (pathName.endsWith("/")) pathName = pathName.slice(0, -1);
				if (!pathName) pathName = "/";

				if (!prod) {
					const filePath = await findFile(
						path.join(dirNames.src.base, dirNames.src.client, pathName),
						[fileNames.style],
					);
					const href = filePath
						? `/${toPosix(path.relative(dirNames.src.base, filePath))}`
						: "";

					if (!href) {
						this.warn(`No client module found for ${pathName}`);
					}

					return getModule({
						tags: `<link rel="stylesheet" href="${href}">`,
						src: {
							src: href,
							file: href,
							module: [],
							preload: [],
							style: [href],
							assets: [],
							dynamic: [],
						},
					});
				}

				// prod
				return getModule(
					await getChunk({ pathName, error: this.error, type: "style" }),
				);
			},
		},
	};
};

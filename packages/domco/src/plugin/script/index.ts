import { dirNames, fileNames } from "../../constants/index.js";
import { findFiles, toAllScriptEndings } from "../../util/fs/index.js";
import { getChunk } from "../../util/manifest/index.js";
import { resolveId } from "../../util/resolve-id/index.js";
import type { Chunk } from "client:page";
import type { Plugin } from "vite";

/**
 * Creates the `client:script` virtual module.
 *
 * @returns Vite plugin
 */
export const scriptPlugin = (): Plugin => {
	const scriptId = "client:script";
	const resolvedScriptId = resolveId(scriptId);

	let prod: boolean | undefined;

	return {
		name: `domco:${scriptId}`,
		config(_config, env) {
			prod = env.mode === "production";
		},

		resolveId: {
			filter: { id: new RegExp(`^${scriptId}`) },
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
					const scriptFiles = await findFiles({
						dir: `${dirNames.src.base}/${dirNames.src.client}`,
						checkEndings: toAllScriptEndings(fileNames.script),
					});

					// link the script from src
					let src = scriptFiles[pathName]?.slice(
						`/${dirNames.src.base}`.length,
					);

					if (!src) {
						this.warn(`No client module found for ${pathName}`);
						src = "";
					}

					return getExports({
						tags: `<script type="module" src="${src}"></script>`,
						src: {
							src,
							file: src, // in dev, link to the src
							module: [src],
							preload: [],
							style: [],
							assets: [],
							dynamic: [],
						},
					});
				}

				// prod
				return getExports(await getChunk({ pathName, error: this.error }));
			},
		},
	};
};

const getExports = (chunk: Chunk) => {
	return (
		`export const tags = ${JSON.stringify(chunk.tags)};\n` +
		`export const src = ${JSON.stringify(chunk.src)};\n`
	);
};

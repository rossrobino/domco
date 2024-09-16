import { dirNames, fileNames } from "../../constants/index.js";
import type { Plugin } from "vite";

/** ID of the app module entry point. */
export const entryId = "domco:entry";

/**
 * Creates a virtual module for the `app.js` entry point.
 *
 * @returns Vite plugin
 */
export const entryPlugin = (): Plugin => {
	const resolvedAppId = `\0${entryId}`;

	return {
		name: "domco:entry",

		resolveId(id) {
			if (id === entryId) {
				return resolvedAppId;
			}
		},

		async load(id) {
			if (id == resolvedAppId) {
				// This prevents having to try different file endings - js/ts/jsx/tsx.
				return `
					export * from "/${dirNames.src.server}/${fileNames.app}";
				`;
			}
		},
	};
};

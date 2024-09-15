import { dirNames, fileNames } from "../../constants/index.js";
import type { Plugin } from "vite";

/** ID of the entry point that exports `createApp`. */
export const appId = "domco:app-entry";

export const entryPlugin = (): Plugin => {
	const resolvedAppId = "\0" + appId;

	return {
		name: "domco:entry",

		resolveId(id) {
			if (id === appId) {
				return resolvedAppId;
			}
		},

		async load(id) {
			if (id == resolvedAppId) {
				return `
					import app from "/${dirNames.src.server}/${fileNames.app}";
					export default app;

					export * from "/${dirNames.src.server}/${fileNames.app}";
				`;
			}
		},
	};
};

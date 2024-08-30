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
				// this entry provides an export of the built app
				// user can create a separate module and import createApp
				// to build their app if adapters do not suit their needs
				return `export { createApp } from "domco/app";`;
			}
		},
	};
};

import { ids } from "../../constants/index.js";
import type { Adapter } from "../../types/index.js";
import type { Plugin } from "vite";

/**
 * Creates a virtual module for the adapter entry point to make
 * the app usable in the target environment.
 *
 * @param adapter
 * @returns Vite plugin
 */
export const adapterPlugin = async (adapter?: Adapter): Promise<Plugin> => {
	const resolvedAdapterId = `\0${ids.adapter}`;

	return {
		name: ids.adapter,

		resolveId(id) {
			if (id === ids.adapter) {
				return resolvedAdapterId;
			}
		},

		load(id) {
			if (id === resolvedAdapterId && adapter) {
				return adapter.entry({ appId: ids.app }).code;
			}
		},
	};
};

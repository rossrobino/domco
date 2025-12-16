import { ids } from "../../constants/index.js";
import type { Adapter } from "../../types/index.js";
import { resolveId } from "../../util/resolve-id/index.js";
import type { Plugin } from "vite";

/**
 * Creates a virtual module for the adapter entry point to make
 * the app usable in the target environment.
 *
 * The virtual module is then used as an entry point in the `vite.config`
 * if there is an adapter entry provided.
 *
 * @param adapter
 * @returns Vite plugin
 */
export const adapterPlugin = async (adapter?: Adapter): Promise<Plugin> => {
	const resolvedAdapterId = resolveId(ids.adapter);

	return {
		name: ids.adapter,

		resolveId: {
			filter: { id: new RegExp(`^${ids.adapter}$`) },
			handler() {
				return resolvedAdapterId;
			},
		},

		load: {
			filter: { id: new RegExp(`^${resolvedAdapterId}$`) },
			handler() {
				if (adapter?.entry) {
					return adapter.entry({ appId: ids.app }).code;
				}
			},
		},
	};
};

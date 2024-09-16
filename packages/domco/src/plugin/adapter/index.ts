import type { Adapter } from "../../types/index.js";
import { entryId } from "../entry/index.js";
import type { Plugin } from "vite";

/** Adapter entry ID for the entry point provided by the adapter. */
export const adapterId = "domco:adapter";

/**
 * Creates a virtual module for the adapter entry point to make
 * the app usable in the target environment.
 *
 * @param adapter
 * @returns vite plugin
 */
export const adapterPlugin = async (adapter?: Adapter): Promise<Plugin> => {
	const resolvedAdapterId = `\0${adapterId}`;

	return {
		name: adapterId,

		resolveId(id) {
			if (id === adapterId) {
				return resolvedAdapterId;
			}
		},

		load(id) {
			if (id === resolvedAdapterId && adapter) {
				return adapter.entry({ appId: entryId }).code;
			}
		},
	};
};

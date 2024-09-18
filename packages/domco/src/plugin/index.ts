import type { DomcoConfig } from "../types/index.js";
import { adapterPlugin } from "./adapter/index.js";
import { configPlugin } from "./config/index.js";
import { configureServerPlugin } from "./configure-server/index.js";
import { lifecyclePlugin } from "./lifecycle/index.js";
import { pagePlugin } from "./page/index.js";
import { scriptPlugin } from "./script/index.js";
import type { Plugin } from "vite";

/**
 * Creates domco Vite plugin, add to your `plugins` array within your `vite.config`
 * to start using domco.
 *
 * @param config Your domco config object.
 * @returns The domco Vite plugin.
 *
 * @example
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { domco } from "domco";
 *
 * export default defineConfig({
 * 	plugins: [domco()],
 * });
 * ```
 */
export const domco = async (
	domcoConfig: DomcoConfig = {},
): Promise<Plugin[]> => {
	const adapter = await domcoConfig.adapter;

	return Promise.all([
		configPlugin(domcoConfig),
		configureServerPlugin(adapter),
		pagePlugin(),
		scriptPlugin(),
		lifecyclePlugin(adapter),
		adapterPlugin(adapter),
	]);
};

import type { DomcoConfig } from "../types/public/index.js";
import { adapterPlugin } from "./adapter/index.js";
import { configPlugin } from "./config/index.js";
import { configureServerPlugin } from "./configure-server/index.js";
import { entryPlugin } from "./entry/index.js";
import { htmlPlugin } from "./html/index.js";
import { lifecyclePlugin } from "./lifecycle/index.js";
import { manifestPlugin } from "./manifest/index.js";
import { routesPlugin } from "./routes/index.js";
import { defu } from "defu";
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
export const domco = async (config?: DomcoConfig): Promise<Plugin[]> => {
	const df = {
		port: { dev: 5173, prod: 5173 },
	};

	const domcoConfig = defu(config, df);

	return [
		await configPlugin(domcoConfig),
		configureServerPlugin(),
		htmlPlugin(),
		await routesPlugin(),
		manifestPlugin(),
		entryPlugin(),
		await adapterPlugin(domcoConfig),
		lifecyclePlugin(),
	];
};

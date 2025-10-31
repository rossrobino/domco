import type { EnvironmentModuleNode, Plugin } from "vite";

/**
 * This plugin accounts for the change from Vite 5 to 6. `ssrLoadModule` no longer
 * automatically reloads the page on the client. In order to get this to work again
 * this plugin must be implemented.
 *
 * This could possibly change in the future:
 * @see https://github.com/vitejs/vite/issues/19114
 *
 * @returns Vite plugin
 */
export const ssrReloadPlugin = (): Plugin => {
	return {
		name: "domco:ssr-reload",
		hotUpdate({ modules, server, timestamp }) {
			if (this.environment.name !== "ssr") return;

			let hasSsrOnlyModule = false;

			const invalidatedModules = new Set<EnvironmentModuleNode>();

			for (const mod of modules) {
				if (!mod.id) continue;

				// check if module exists in the client module graph
				const clientModule =
					server.environments.client.moduleGraph.getModuleById(mod.id);
				// if so, the client env will handle the update
				if (clientModule) continue;

				// if we get here, must be a module that is only SSR, invalidate it
				this.environment.moduleGraph.invalidateModule(
					mod,
					invalidatedModules,
					timestamp,
					false,
				);

				hasSsrOnlyModule = true;
			}

			if (
				hasSsrOnlyModule ||
				// otherwise check if there are also no modules --> it's likely a virtual page
				modules.length === 0
			) {
				server.ws.send({ type: "full-reload" });

				return []; // skip Vite's invalidation since it's handled above
			}
		},
	};
};

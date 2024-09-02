import type { DomcoConfig } from "../../types/public/index.js";
import { appId } from "../entry/index.js";
import { styleText } from "node:util";
import type { Plugin, ResolvedConfig } from "vite";

/** SSR entry ID for the entrypoint provided by the adapter. */
export const ssrId = "domco:ssr-entry";

export const adapterPlugin = async (
	domcoConfig: DomcoConfig,
): Promise<Plugin> => {
	const ssrResolvedId = "\0" + ssrId;

	const adapter = await domcoConfig.adapter;

	let viteConfig: ResolvedConfig;

	return {
		name: "domco:adapter",

		configResolved(config) {
			viteConfig = config;
		},

		resolveId(id) {
			if (id === ssrId) {
				return ssrResolvedId;
			}
		},

		async load(id) {
			if (id === ssrResolvedId && adapter) {
				// adapter provided entry point that imports the final app
				// and makes it usable in the target environment.
				return adapter.entry({
					// @ts-expect-error - this will always be defined due to df merge at plugin start
					port: domcoConfig.port?.prod,
					appId,
				});
			}
		},

		async closeBundle() {
			if (viteConfig.build.ssr) {
				if (adapter) {
					if (adapter.run) {
						await adapter.run();
					}

					console.log(styleText("bold", `adapter - ${adapter.name}`));
					console.log(styleText(["dim", "italic"], adapter.message));
					console.log();
				}

				console.log(styleText("bold", "✓ build complete"));

				console.log(
					styleText(
						["dim", "italic"],
						"run `vite preview` to preview your app with Vite",
					),
				);

				console.log();
				console.log();
			}
		},
	};
};

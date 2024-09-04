import type { DomcoConfig } from "../../types/public/index.js";
import { style } from "../../util/style/index.js";
import { appId } from "../entry/index.js";
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

					console.log(style.bold(`adapter - ${adapter.name}`));
					console.log(style.dim(style.italic(adapter.message)));
					console.log();
				}

				console.log(style.bold("✓ build complete"));

				console.log(
					style.dim(
						style.italic("run `vite preview` to preview your app with Vite"),
					),
				);

				console.log();
				console.log();
			}
		},
	};
};

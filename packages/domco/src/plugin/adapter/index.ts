import type { Adapter } from "../../types/public/index.js";
import { style } from "../../util/style/index.js";
import { appId } from "../entry/index.js";
import type { Plugin, ResolvedConfig } from "vite";

/** SSR entry ID for the entrypoint provided by the adapter. */
export const ssrId = "domco:ssr-entry";

export const adapterPlugin = async (adapter?: Adapter): Promise<Plugin> => {
	const ssrResolvedId = "\0" + ssrId;

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

		load(id) {
			if (id === ssrResolvedId && adapter) {
				// adapter provided entry point that imports the final app
				// and makes it usable in the target environment.
				return adapter.entry({ appId }).code;
			}
		},

		async closeBundle() {
			if (viteConfig.build.ssr) {
				if (adapter) {
					console.log(style.bold(`adapter - ${adapter.name}`));

					if (adapter.run) {
						await adapter.run();
					}

					console.log(style.dim(style.italic(adapter.message)));
					console.log();
				}

				console.log(style.bold("✓ build complete"));

				console.log(
					style.dim(
						style.italic(
							"run `vite preview` to preview your app with Vite and Node.js",
						),
					),
				);

				console.log();
				console.log();
			}
		},
	};
};

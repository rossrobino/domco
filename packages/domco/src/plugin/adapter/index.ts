import { dirNames, fileNames } from "../../constants/index.js";
import type { DomcoConfig } from "../../types/public/index.js";
import { appId } from "../entry/index.js";
import pc from "picocolors";
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
					await adapter.run();
					console.log(pc.bold(`adapter - ${adapter.name}`));
					console.log(pc.dim(pc.italic(adapter.message)));
					console.log();
				}
				console.log(pc.bold("✓ build complete"));
				console.log(
					pc.dim(
						pc.italic(
							`${adapter ? "preview a node version of" : "start"} your server by running \`node ${dirNames.out.base}/${dirNames.out.ssr}/${fileNames.out.entry.node}\``,
						),
					),
				);
				console.log();
				console.log();
			}
		},
	};
};

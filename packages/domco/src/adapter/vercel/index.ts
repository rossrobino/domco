import { dirNames, fileNames, headers } from "../../constants/index.js";
import type { AdapterBuilder, AdapterEntry } from "../../types/public/index.js";
import { bundle, clearDir, copyStatic } from "../util/index.js";
import type {
	PrerenderFunctionConfig,
	NodejsServerlessFunctionConfig,
	OutputConfig,
	EdgeFunctionConfig,
} from "./types/index.js";
import { defu } from "defu";
import type { HonoOptions } from "hono/hono-base";
import fs from "node:fs/promises";
import path from "path";

// two separate types are required because we do not want the user to
// be able to set some of the values that are required.
type RequiredOptions =
	| {
			config: NodejsServerlessFunctionConfig;
			isr?: PrerenderFunctionConfig;
	  }
	| { config: EdgeFunctionConfig; isr?: never };

type VercelAdapterOptions =
	| {
			/**
			 * Serverless function config.
			 *
			 * @default
			 *
			 * {
			 * 	handler: "index.mjs",
			 * 	runtime: "nodejs20.x",
			 * 	launcherType: "Nodejs",
			 * }
			 */
			config?: Partial<
				Omit<NodejsServerlessFunctionConfig, "handler" | "launcherType">
			>;
			/**
			 * ISR config.
			 *
			 * Use [Incremental Static Regeneration](https://vercel.com/docs/concepts/incremental-static-regeneration/overview)
			 * to cache the result of a serverless function as a static asset for a given timeframe.
			 *
			 * For example, to refresh the page every minute, set the `expiration` to `60` seconds.
			 *
			 * Recommended to not use [Hono ETag middleware](https://hono.dev/docs/middleware/builtin/etag) if using ISR. If response is marked as STALE by Vercel but the content hasn't changed, edge server will send request to node server and it will respond 304 NOT MODIFIED. Vercel will never update the edge cache again with the new content and will continue to be STALE. This will result in a new request to the node server every time instead of getting the advantage ISR provides. User can easily apply etag within app if needed instead.
			 *
			 * @default undefined
			 *
			 * @example isr: { expiration: 60 }
			 */
			isr?: Omit<PrerenderFunctionConfig, "fallback" | "group">;
	  }
	| {
			/**
			 * Edge function config.
			 */
			config?: Omit<EdgeFunctionConfig, "entrypoint">;
			/**
			 * ISR is not available for edge functions. Change `config.runtime` to "nodejs20.x" to use ISR.
			 */
			isr?: never;
	  };

const fnName = "fn";

const nodeEntry: AdapterEntry = ({ appId }) => {
	const getPath: HonoOptions<{}>["getPath"] = (req) => {
		const url = new URL(req.url);
		const params = new URLSearchParams(url.search);

		const pathnameParam = "__pathname";
		const pathname = `/${params.get(pathnameParam) ?? ""}`;

		if (pathname) {
			params.delete(pathnameParam);
			return `${pathname}${params.toString() ? `?${params}` : ""}`;
		}

		return req.url;
	};

	return `
import { createApp } from "${appId}";
import { handle } from '@hono/node-server/vercel'

const app = createApp({
	honoOptions: {
		getPath: ${getPath.toString()}
	}
});

export default handle(app);
`;
};

const edgeEntry: AdapterEntry = ({ appId }) => {
	return `
import { createApp } from "${appId}";
import { handle } from "hono/vercel";

const app = createApp();

export default handle(app);
`;
};

/**
 * Creates a [Vercel](https://vercel.com) build according to the build output API spec.
 *
 * - Supports Serverless, Serverless with ISR, and Edge.
 *
 * @param options adapter options - configure runtime, ISR, etc.
 * @returns Vercel domco adapter.
 *
 * @example
 *
 * ```ts
 * import { domco } from "domco";
 * import { adapter } from "domco/adapter/vercel";
 * import { defineConfig } from "vite";
 *
 * export default defineConfig({
 * 	plugins: [
 * 		domco({
 * 			adapter: adapter(),
 * 		}),
 * 	],
 * });
 * ```
 */
export const adapter: AdapterBuilder<VercelAdapterOptions | undefined> = (
	options,
) => {
	const isEdge = options?.config?.runtime === "edge";
	let df: RequiredOptions;

	if (isEdge) {
		df = {
			config: {
				entrypoint: fileNames.out.entry.main,
				runtime: "edge",
			},
		};
	} else {
		// node default
		df = {
			config: {
				handler: fileNames.out.entry.main,
				runtime: "nodejs20.x",
				launcherType: "Nodejs",
			},
		};
	}

	const resolvedOptions = defu(options, df) as RequiredOptions;

	return {
		name: "vercel",

		message: `created ${resolvedOptions.config.runtime} build .vercel/`,

		entry: isEdge ? edgeEntry : nodeEntry,

		run: async () => {
			const outDir = path.join(".vercel", "output");

			await clearDir(outDir);

			await bundle({
				outFile: `.vercel/output/functions/${fnName}.func/${fileNames.out.entry.main}`,
				platform: isEdge ? "browser" : "node",
			});

			await copyStatic(path.join(outDir, "static"));

			const outputConfig: OutputConfig = {
				version: 3,
				framework: {
					slug: "domco",
					version: "next",
				},
				routes: [
					{
						src: `/${dirNames.out.client.immutable}/.+`,
						headers: {
							"cache-control": headers.cacheControl.immutable,
						},
					},
					// required for static files, checks this first
					{
						methods: ["GET"],
						handle: "filesystem",
					},
					// falls back to function, this reroutes everything to /index
					{
						src: "^/(.*)$",
						dest: `/${fnName}?__pathname=$1`,
					},
				],
			};

			await fs.writeFile(
				path.join(outDir, "config.json"),
				JSON.stringify(outputConfig, null, "\t"),
			);

			// write vc.config
			await fs.writeFile(
				path.join(outDir, "functions", `${fnName}.func`, ".vc-config.json"),
				JSON.stringify(resolvedOptions.config, null, "\t"),
			);

			// write package.json
			// otherwise have to output mjs, either way works
			await fs.writeFile(
				path.join(outDir, "functions", `${fnName}.func`, "package.json"),
				JSON.stringify({ type: "module" }, null, "\t"),
			);

			if (resolvedOptions.isr) {
				const defaultIsr: Partial<PrerenderFunctionConfig> = {
					allowQuery: ["__pathname"],
					group: 1,
					passQuery: true,
				};
				// TODO add prerender fallback
				// write prerender-config
				await fs.writeFile(
					path.join(outDir, "functions", `${fnName}.prerender-config.json`),
					JSON.stringify(defu(resolvedOptions.isr, defaultIsr), null, "\t"),
				);
			}
		},
	};
};
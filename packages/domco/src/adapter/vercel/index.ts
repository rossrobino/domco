import { dirNames, headers } from "../../constants/index.js";
import type {
	AdapterBuilder,
	AdapterEntry,
	AdapterMiddleware,
} from "../../types/public/index.js";
import { clearDir, copyClient, copyServer } from "../../util/fs/index.js";
import { version } from "../../version/index.js";
import type {
	PrerenderFunctionConfig,
	OutputConfig,
	RequiredOptions,
	VercelAdapterOptions,
} from "./types.js";
import fs from "node:fs/promises";
import path from "node:path";

/** This function is required for ISR. */
export const getUrl = (req: Request) => {
	const url = new URL(req.url);
	const params = new URLSearchParams(url.search);

	const pathnameParam = "__pathname";
	const pathname = `/${params.get(pathnameParam) ?? ""}`;

	params.delete(pathnameParam);
	url.pathname = pathname;

	return url;
};

const entryId = "main";

/** Use when runtime is set to node. */
const nodeEntry: AdapterEntry = ({ appId }) => {
	return {
		id: entryId,
		code: `
import handler from "${appId}";
import { createRequestListener } from "domco/request-listener";

export default createRequestListener(handler);
`,
	};
};

/** Use when runtime is set to node and ISR. */
const isrEntry: AdapterEntry = ({ appId }) => {
	return {
		id: entryId,
		code: `
import handler from "${appId}";
import { createRequestListener } from "domco/request-listener";
import { getUrl } from "domco/adapter/vercel";

const isrHandler = async (req) => handler(new Request(getUrl(req)));

export default createRequestListener(isrHandler);
`,
	};
};

/** Use when runtime is edge. */
const edgeEntry: AdapterEntry = ({ appId }) => {
	return {
		id: entryId,
		code: `
import handler from "${appId}";

export default handler;
`,
	};
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

	let resolvedOptions: RequiredOptions;

	if (isEdge) {
		resolvedOptions = {
			config: {
				entrypoint: `${entryId}.js`,
				runtime: "edge",
			},
		};
	} else {
		// node default
		resolvedOptions = {
			config: {
				handler: `${entryId}.js`,
				runtime: "nodejs20.x",
				launcherType: "Nodejs",
			},
		};
	}

	// can't do this at top level or it will override the defaults set above
	Object.assign(resolvedOptions.config, options?.config);

	// could be undefined
	resolvedOptions.isr = options?.isr;
	resolvedOptions.images = options?.images;

	let entry = nodeEntry;
	if (isEdge) entry = edgeEntry;
	else if (options?.isr) entry = isrEntry;

	/**
	 * This is applied in `dev` and `preview` so users can see the src images.
	 */
	const imageMiddleware: AdapterMiddleware = async (req, res, next) => {
		if (resolvedOptions.images) {
			if (req.url?.startsWith("/_vercel/image")) {
				const query = new URLSearchParams(req.url.split("?")[1]);

				const url = query.get("url");
				const w = query.get("w");
				const q = query.get("q");

				if (!url) throw new Error(`Add a \`url\` query param to ${req.url}`);
				if (!w) throw new Error(`Add a \`w\` query param to ${req.url}`);
				if (!q) throw new Error(`Add a \`q\` query param to ${req.url}`);

				if (!resolvedOptions.images.sizes.includes(parseInt(w))) {
					throw new Error(
						`\`${w}\` is not an included image size. Add \`${w}\` to \`sizes\` in your adapter config to support this width.`,
					);
				}

				res.writeHead(302, { Location: url });
				return res.end();
			}
		}

		return next();
	};

	return {
		name: "vercel",
		target: isEdge ? "webworker" : "node",
		noExternal: true,
		message: `created ${resolvedOptions.config.runtime} build .vercel/`,
		entry,
		devMiddleware: [imageMiddleware],
		previewMiddleware: [imageMiddleware],

		run: async () => {
			const outDir = path.join(".vercel", "output");
			const fnName = "fn";
			const fnDir = path.join(outDir, "functions", `${fnName}.func`);

			const outputConfig: OutputConfig = {
				version: 3,
				framework: {
					slug: "domco",
					version,
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
					// falls back to function, this reroutes everything
					{
						src: "^/(.*)$",
						dest: `/${fnName}?__pathname=$1`,
					},
				],
			};

			if (resolvedOptions.images) {
				outputConfig.images = resolvedOptions.images;
			}

			const defaultIsr: Partial<PrerenderFunctionConfig> = {
				allowQuery: ["__pathname"],
				group: 1,
				passQuery: true,
			};

			await clearDir(outDir);

			await fs.mkdir(fnDir, { recursive: true });

			await Promise.all([
				copyClient(path.join(outDir, "static")),

				copyServer(fnDir),

				fs.writeFile(
					path.join(outDir, "config.json"),
					JSON.stringify(outputConfig, null, "\t"),
				),

				// write vc.config
				fs.writeFile(
					path.join(outDir, "functions", `${fnName}.func`, ".vc-config.json"),
					JSON.stringify(resolvedOptions.config, null, "\t"),
				),

				// write package.json
				// otherwise have to output mjs, either way works
				fs.writeFile(
					path.join(outDir, "functions", `${fnName}.func`, "package.json"),
					JSON.stringify({ type: "module" }, null, "\t"),
				),
			]);

			if (resolvedOptions.isr) {
				// TODO add prerender fallback
				// write prerender-config
				await fs.writeFile(
					path.join(outDir, "functions", `${fnName}.prerender-config.json`),
					JSON.stringify(
						Object.assign(defaultIsr, resolvedOptions.isr),
						null,
						"\t",
					),
				);
			}
		},
	};
};

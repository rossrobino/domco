import type {
	OutputConfig,
	PrerenderFunctionConfig,
	RequiredOptions,
	Route,
	VercelAdapterOptions,
} from "./types.js";
import type { AdapterBuilder, AdapterEntry, AdapterMiddleware } from "domco";
import { dirNames, headers } from "domco/constants";
import { clearDir, copyClient, copyServer } from "domco/util";
import { version } from "domco/version";
import fs from "node:fs/promises";
import path from "node:path";

const entryId = "main";
const pathnameParam = "__pathname";

/** Use when runtime is set to node. */
const nodeEntry: AdapterEntry = ({ appId }) => {
	return {
		id: entryId,
		code: `
import app from "${appId}";
import { nodeListener } from "domco/listener";

export default nodeListener(app.fetch);
`,
	};
};

/**
 * This function is required for ISR.
 *
 * Gets the `__pathname` query param and sets the url pathname
 * to it. See `allowQuery` in config.
 */
export const getRequest = (req: Request) => {
	const url = new URL(req.url);
	const params = new URLSearchParams(url.search);

	const pathname = `/${params.get(pathnameParam) ?? ""}`;

	params.delete(pathnameParam);
	url.pathname = pathname;

	return new Request(url, {
		method: req.method,
		headers: req.headers,
		body: req.body,
	});
};

/** Use when runtime is set to node + ISR. */
const isrEntry: AdapterEntry = ({ appId }) => {
	return {
		id: entryId,
		code: `
import app from "${appId}";
import { nodeListener } from "domco/listener";
import { getRequest } from "@domcojs/vercel";

const isrHandler = (req) => app.fetch(getRequest(req));

export default nodeListener(isrHandler);
`,
	};
};

/**
 * Creates a [Vercel](https://vercel.com) build according to the build output API spec.
 *
 * - Supports Serverless and Serverless with ISR.
 *
 * @param options adapter options - configure runtime, ISR, etc.
 * @returns Vercel domco adapter.
 *
 * @example
 *
 * ```ts
 * import { adapter } from "@domcojs/vercel";
 * import { domco } from "domco";
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
	const resolvedOptions: RequiredOptions = {
		config: {
			handler: `${entryId}.js`,
			runtime: "nodejs22.x",
			launcherType: "Nodejs",
		},
	};

	// can't do this at top level or it will override the defaults set above
	Object.assign(resolvedOptions.config, options?.config);

	resolvedOptions.isr = options?.isr;
	resolvedOptions.images = options?.images;
	resolvedOptions.trailingSlash = options?.trailingSlash;

	/**
	 * This is applied in `dev` and `preview` so users can see the src images.
	 */
	const imageMiddleware: AdapterMiddleware = (req, res, next) => {
		if (resolvedOptions.images) {
			if (req.url?.startsWith("/_vercel/image")) {
				const query = new URLSearchParams(req.url.split("?")[1]);

				const url = query.get("url");
				const w = query.get("w");
				const q = query.get("q");

				if (!url)
					return next(new Error(`Add a \`url\` query param to ${req.url}`));
				if (!w) return next(new Error(`Add a \`w\` query param to ${req.url}`));
				if (!q) return next(new Error(`Add a \`q\` query param to ${req.url}`));

				if (!resolvedOptions.images.sizes.includes(parseInt(w))) {
					return next(
						new Error(
							`\`${w}\` is not an included image size. Add \`${w}\` to \`sizes\` in your adapter config to support this width.`,
						),
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
		target: "node",
		noExternal: true, // bundle server code with Vite
		message: `created ${resolvedOptions.config.runtime} build .vercel/`,
		entry: resolvedOptions.isr ? isrEntry : nodeEntry,
		devMiddleware: [imageMiddleware],
		previewMiddleware: [imageMiddleware],

		run: async () => {
			const outDir = path.join(".vercel", "output");
			const fnName = "fn";
			const fnDir = path.join(outDir, "functions", `${fnName}.func`);

			const routes: Route[] = [];

			// `undefined` = no redirects
			if (resolvedOptions.trailingSlash === true) {
				routes.push(
					{
						src: "^/((?:[^/]+/)*[^/\\.]+)$",
						headers: { Location: "/$1/" },
						status: 308,
					},
					{
						src: "^/((?:[^/]+/)*[^/]+\\.\\w+)/$",
						headers: { Location: "/$1" },
						status: 308,
					},
				);
			} else if (resolvedOptions.trailingSlash === false) {
				routes.push({
					src: "^/(.*)\\/$",
					headers: { Location: "/$1" },
					status: 308,
				});
			}

			routes.push(
				{
					src: `/${dirNames.out.client.immutable}/.+`,
					headers: { "Cache-Control": headers.cacheControl.immutable },
				},
				// required for static files, checks this first
				{ methods: ["GET"], handle: "filesystem" },
				// falls back to function, this reroutes everything
				{ src: "^/(.*)$", dest: `/${fnName}?${pathnameParam}=$1` },
			);

			const outputConfig: OutputConfig = {
				version: 3,
				framework: { slug: "domco", version },
				routes,
			};

			if (resolvedOptions.images) {
				outputConfig.images = resolvedOptions.images;
			}

			await clearDir(outDir);

			await fs.mkdir(fnDir, { recursive: true });

			const tasks = [
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
			];

			if (resolvedOptions.isr) {
				const defaultIsr: Partial<PrerenderFunctionConfig> = {
					allowQuery: [],
					group: 1,
					passQuery: true,
				};

				const mergedIsr: PrerenderFunctionConfig = Object.assign(
					defaultIsr,
					resolvedOptions.isr,
				);

				// must allow the pathname param otherwise all pages will be
				// directed to "/"
				if (mergedIsr.allowQuery) {
					mergedIsr.allowQuery.push(pathnameParam);
				} else {
					mergedIsr.allowQuery = [pathnameParam];
				}

				tasks.push(
					// write prerender-config
					fs.writeFile(
						path.join(outDir, "functions", `${fnName}.prerender-config.json`),
						JSON.stringify(
							Object.assign(defaultIsr, resolvedOptions.isr),
							null,
							"\t",
						),
					),
				);
			}

			await Promise.all(tasks);
		},
	};
};

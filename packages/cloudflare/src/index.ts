import type { AdapterBuilder } from "domco";
import { dirNames, headers } from "domco/constants";
import { clearDir, copyClient, copyServer, toPosix } from "domco/util";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/**
 * Creates a Cloudflare Pages build.
 *
 * @param options adapter options
 * @returns Cloudflare domco adapter.
 *
 * @example
 *
 * ```ts
 * import { adapter } from "@domcojs/cloudflare";
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
export const adapter: AdapterBuilder = async () => {
	return {
		name: "cloudflare",
		target: "webworker",
		noExternal: true,
		message:
			"created Cloudflare Pages build .cloudflare/\ninstall wrangler and run `wrangler pages dev .cloudflare` to preview your build\nhttps://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler\nhttps://developers.cloudflare.com/workers/wrangler/commands/#pages",

		entry: ({ appId }) => {
			return {
				id: "_worker",
				code: `
					import app from "${appId}";
					export default app;
				`,
			};
		},

		run: async () => {
			const outDir = ".cloudflare";

			const routes = {
				version: 1,
				description: "Generated by `domco/adapter/cloudflare`.",
				include: ["/*"],
				exclude: [`/${dirNames.out.client.immutable}/*`],
			};

			/**
			 * Adds paths to exclude from when the worker gets called.
			 * Need to exclude all static files, since these will be served in
			 * front of the function.
			 *
			 * @param dir directory to walk
			 */
			const addExclusions = async (dir?: string) => {
				const base = path.join(
					process.cwd(),
					dirNames.out.base,
					dirNames.out.client.base,
				);

				if (!dir) dir = base;

				const staticFiles = await fs.readdir(dir, { withFileTypes: true });

				const subDirPromises: Promise<void>[] = [];

				for (const file of staticFiles) {
					const filePath = path.join(dir, file.name);
					let relativePath = toPosix(`/${path.relative(base, filePath)}`);

					if (
						// already added via wildcard
						relativePath.startsWith(`/${dirNames.out.client.immutable}`) ||
						// manifest
						relativePath.startsWith("/.vite")
					) {
						continue;
					}

					if (file.isDirectory()) {
						subDirPromises.push(addExclusions(filePath));
						continue;
					}

					if (relativePath.endsWith("index.html")) {
						// remove "index.html" from end
						relativePath = relativePath.slice(0, -11);
						if (relativePath === "") {
							relativePath = "/";
						}
					} else if (relativePath.endsWith("html")) {
						// remove ".html" from end
						relativePath = relativePath.slice(0, -5);
					}

					routes.exclude.push(relativePath);
				}

				await Promise.all(subDirPromises);
			};

			await Promise.all([addExclusions(), clearDir(outDir)]);

			await Promise.all([
				// copy output into .cloudflare
				copyClient(outDir),
				copyServer(outDir),

				fs.writeFile(
					path.join(outDir, "_routes.json"),
					JSON.stringify(routes, null, "\t"),
				),
				fs.writeFile(
					path.join(outDir, "_headers"),
					`/${dirNames.out.client.immutable}/*\n  ! Cache-Control\n\tCache-Control: ${headers.cacheControl.immutable}`,
				),
			]);
		},
	};
};

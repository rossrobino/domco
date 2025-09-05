import { dirNames, fileNames, ids } from "../../constants/index.js";
import type { Adapter, DomcoConfig } from "../../types/index.js";
import { findFiles, toAllScriptEndings } from "../../util/fs/index.js";
import path from "node:path";
import process from "node:process";
import { type Plugin, createLogger } from "vite";

/**
 * Dynamically sets the Vite config.
 *
 * @param domcoConfig
 * @returns Vite plugin
 */
export const configPlugin = async (
	domcoConfig: DomcoConfig,
): Promise<Plugin> => {
	const adapter = await domcoConfig.adapter;

	return {
		name: "domco:config",
		async config(_, { isSsrBuild, command }) {
			const build = command === "build";

			const customLogger = createLogger();
			const loggerInfo = customLogger.info;
			customLogger.info = (msg, _options) => {
				if (build && msg.includes("../dist")) {
					// usually logs output relative to root, correct
					return loggerInfo(msg.split("../dist/").join("dist/"));
				}

				return loggerInfo(msg);
			};

			return {
				customLogger,
				resolve: {
					alias: [{ find: "@", replacement: path.resolve(dirNames.src.base) }],
				},
				root: dirNames.src.base,
				publicDir: isSsrBuild
					? false
					: path.join(process.cwd(), dirNames.public),
				envDir: process.cwd(),
				appType: "custom",
				ssr: {
					target: adapter?.target,
					noExternal: build ? adapter?.noExternal : undefined,
				},
				optimizeDeps: {
					// fixes TypeError when this is left undefined
					entries: [],
				},
				build: {
					manifest: !isSsrBuild,
					outDir: path.join(
						process.cwd(),
						dirNames.out.base,
						isSsrBuild ? dirNames.out.ssr : dirNames.out.client.base,
					),
					emptyOutDir: true,
					rollupOptions: {
						input: isSsrBuild ? serverEntry(adapter) : await clientEntry(),
						output: {
							entryFileNames({ name }) {
								if (name.startsWith("/")) name = name.slice(1);
								return `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}${name}${isSsrBuild ? "" : ".[hash]"}.js`;
							},
							assetFileNames: `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}assets/[name].[hash][extname]`,
							chunkFileNames: `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}chunks/[name].[hash].js`,
						},
					},
					// `rel=modulepreload` is supported in all major browsers as of 2023
					// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload#browser_compatibility
					modulePreload: false,
				},
			};
		},
	};
};

const serverEntry = (adapter?: Adapter) => {
	const entry: Record<string, string> = {
		[fileNames.out.entry.app.split(".")[0]!]: ids.app,
	};

	// only create an adapter entry point if there's an adapter with entry
	if (adapter?.entry) {
		entry[adapter.entry({ appId: ids.app }).id] = ids.adapter;
	}

	return entry;
};

const clientEntry = async () => {
	const [pages, scripts] = await Promise.all([
		findFiles({
			dir: path.join(dirNames.src.base, dirNames.src.client),
			checkEndings: [fileNames.page],
		}),
		findFiles({
			dir: path.join(dirNames.src.base, dirNames.src.client),
			checkEndings: toAllScriptEndings(fileNames.script),
		}),
	]);

	// rename "/" keys to main
	if (pages["/"]) {
		pages.main = pages["/"];
		delete pages["/"];
	}
	if (scripts["/"]) {
		scripts["/main"] = scripts["/"];
		delete scripts["/"];
	}

	// pages and scripts have to start with "src/" instead of just "/client"
	// for builds to work on Windows
	for (const [key, value] of Object.entries(pages)) {
		pages[key] = value.slice(1); // remove "/"
	}

	const scriptsEntry: Record<string, string> = {};

	for (const [key, value] of Object.entries(scripts)) {
		scriptsEntry[`/_script${key}`] = value.slice(1); // remove "/"
	}

	return Object.assign(pages, scriptsEntry);
};

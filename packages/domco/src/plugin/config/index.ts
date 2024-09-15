import { dirNames, fileNames } from "../../constants/index.js";
import type { Adapter, DomcoConfig } from "../../types/public/index.js";
import { findFiles, toAllScriptEndings } from "../../util/fs/index.js";
import { ssrId } from "../adapter/index.js";
import { appId } from "../entry/index.js";
import path from "node:path";
import process from "node:process";
import type { Plugin } from "vite";

export const configPlugin = async (
	domcoConfig: DomcoConfig,
): Promise<Plugin> => {
	const adapter = await domcoConfig.adapter;

	return {
		name: "domco:config",
		async config(_, { isSsrBuild, command }) {
			/** If Vite is building. */
			const build = command === "build";

			return {
				resolve: {
					alias: [
						{
							find: "@",
							replacement: path.resolve(dirNames.src.base),
						},
					],
				},
				root: dirNames.src.base,
				publicDir: isSsrBuild
					? false
					: path.join(process.cwd(), dirNames.public),
				appType: "custom",
				ssr: {
					target: adapter?.target,
					noExternal: adapter?.noExternal,
				},
				logLevel: build ? "warn" : "info",
				build: {
					manifest: !isSsrBuild,
					target: "es2022",
					outDir: isSsrBuild
						? path.join(process.cwd(), dirNames.out.base, dirNames.out.ssr)
						: path.join(
								process.cwd(),
								dirNames.out.base,
								dirNames.out.client.base,
							),
					emptyOutDir: true,
					rollupOptions: {
						input: isSsrBuild ? serverEntry(adapter) : await clientEntry(),
						output: {
							entryFileNames({ name }) {
								if (name.startsWith("/")) name = name.slice(1);
								return `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}${name}${isSsrBuild ? "" : "/[hash]"}.js`;
							},
							assetFileNames: `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}assets/[name]/[hash][extname]`,
							chunkFileNames: `${isSsrBuild ? "" : dirNames.out.client.immutable + "/"}chunks/[name]/[hash].js`,
						},
					},
					// rel=modulepreload is supported in all major browsers as of 2023
					// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload#browser_compatibility
					modulePreload: false,
				},
			};
		},
	};
};

const serverEntry = (adapter?: Adapter) => {
	const entry: Record<string, string> = {
		app: appId,
	};

	// only create an adapter entrypoint if there's an adapter
	if (adapter) {
		entry[adapter.entry({ appId }).id] = ssrId;
	}

	return entry;
};

const clientEntry = async () => {
	const pages = await findFiles({
		dir: path.join(dirNames.src.base, dirNames.src.client),
		checkEndings: [fileNames.page],
	});

	// rename key
	if (pages["/"]) {
		pages.main = pages["/"];
		delete pages["/"];
	}

	// remove leading slash
	for (const key in pages) {
		const entryPath = pages[key];
		if (entryPath) {
			pages[key] = entryPath.slice(1);
		}
	}

	const scripts = await findFiles({
		dir: path.join(dirNames.src.base, dirNames.src.client),
		checkEndings: toAllScriptEndings(fileNames.script),
	});

	// rename key
	if (scripts["/"]) {
		scripts["/main"] = scripts["/"];
		delete scripts["/"];
	}

	const scriptsEntry: Record<string, string> = {};

	for (const [key, value] of Object.entries(scripts)) {
		scriptsEntry[`/_script${key}`] = value.slice(1);
	}

	return Object.assign(pages, scriptsEntry);
};

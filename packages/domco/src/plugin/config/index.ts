import { dirNames, fileNames } from "../../constants/index.js";
import type { DomcoConfig } from "../../types/public/index.js";
import { findFiles, toAllScriptEndings } from "../../util/fs/index.js";
import { ssrId } from "../adapter/index.js";
import { appId, nodeId } from "../entry/index.js";
import { routesId } from "../routes/index.js";
import path from "node:path";
import type { Plugin } from "vite";

export const configPlugin = async (
	domcoConfig: DomcoConfig,
): Promise<Plugin> => {
	const adapter = await domcoConfig.adapter;

	return {
		name: "domco:config",
		async config(_, { isSsrBuild, command }) {
			return {
				server: {
					port: domcoConfig.port?.dev,
				},
				resolve: {
					alias: [
						{
							find: "@",
							replacement: path.resolve(dirNames.src),
						},
					],
				},
				root: dirNames.src,
				publicDir: isSsrBuild
					? false
					: path.join(process.cwd(), dirNames.public),
				appType: "custom",
				ssr: {
					noExternal: ["domco"],
				},
				logLevel: command === "build" ? "warn" : "info",
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

const serverEntry = (adapter: DomcoConfig["adapter"]) => {
	const entry: Record<string, string> = {
		app: appId,
		routes: routesId,
		node: nodeId,
	};
	if (adapter) entry.main = ssrId;
	return entry;
};

const clientEntry = async () => {
	const entryPoints = await findFiles({
		dir: dirNames.src,
		checkEndings: [fileNames.page],
	});

	// rename key
	if (entryPoints["/"]) {
		entryPoints.main = entryPoints["/"];
		delete entryPoints["/"];
	}

	// remove leading slash
	for (const key in entryPoints) {
		const entryPath = entryPoints[key];
		if (entryPath) {
			entryPoints[key] = entryPath.slice(1);
		}
	}

	const jsFiles = await findFiles({
		dir: dirNames.src,
		checkEndings: toAllScriptEndings("+client"),
	});

	// rename key
	if (jsFiles["/"]) {
		jsFiles["/main"] = jsFiles["/"];
		delete jsFiles["/"];
	}

	const jsEntry: Record<string, string> = {};

	for (const [key, value] of Object.entries(jsFiles)) {
		jsEntry[`/_client${key}`] = value.slice(1);
	}

	return Object.assign(entryPoints, jsEntry);
};
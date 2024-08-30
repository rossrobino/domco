import { dirNames } from "../../constants/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import type { Plugin } from "vite";

export const manifestPlugin = (): Plugin => {
	const manifestId = "domco:manifest";
	const resolvedManifestId = "\0" + manifestId;

	return {
		name: manifestId,
		apply: "build",
		resolveId(id) {
			if (id === manifestId) {
				return resolvedManifestId;
			}
		},

		async load(id) {
			if (id === resolvedManifestId) {
				const json = await fs.readFile(
					path.join(
						process.cwd(),
						dirNames.out.base,
						dirNames.out.client.base,
						".vite",
						"manifest.json",
					),
					"utf-8",
				);

				return `export const manifest = ${json};`;
			}
		},
	};
};

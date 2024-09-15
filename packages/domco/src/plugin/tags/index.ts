import { dirNames, fileNames } from "../../constants/index.js";
import { serializeTags, type TagDescriptor } from "../../injector/index.js";
import { findFiles, toAllScriptEndings, toPosix } from "../../util/fs/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Manifest, ManifestChunk, Plugin } from "vite";

export const tagsPlugin = (): Plugin => {
	const tagsId = "client:tags";

	let prod: boolean | undefined;

	return {
		name: `domco:${tagsId}`,
		config(_config, env) {
			prod = env.mode === "production";
		},

		resolveId(id) {
			if (id.startsWith(tagsId)) {
				return `\0${id}`;
			}
		},

		async load(id) {
			const beginning = `\0${tagsId}`;

			if (id.startsWith(beginning)) {
				let pathName = id.slice(beginning.length);

				// remove trailing slash
				if (pathName.endsWith("/")) pathName = pathName.slice(0, -1);

				if (!pathName) pathName = "/";

				const tags: TagDescriptor[] = [];

				if (!prod) {
					const scriptFiles = await findFiles({
						dir: `${dirNames.src.base}/${dirNames.src.client}`,
						checkEndings: toAllScriptEndings(fileNames.script),
					});

					// link the script from src
					const src = scriptFiles[pathName]?.slice(
						`/${dirNames.src.base}`.length,
					);

					console.log(src);

					if (!src) this.warn(`No client module found for ${pathName}`);

					tags.push({
						tag: "script",
						attrs: { type: "module", src },
					});
				} else {
					// read from manifest
					const manifest: Manifest = JSON.parse(
						await fs.readFile(
							path.join(
								dirNames.out.base,
								dirNames.out.client.base,
								".vite",
								"manifest.json",
							),
							"utf-8",
						),
					);

					tags.push(
						...getTagsForEntry({ manifest, pathName, error: this.error }),
					);
				}

				return `export default ${JSON.stringify(serializeTags(tags))};`;
			}
		},
	};
};

const getTagsForEntry = (options: {
	manifest: Manifest;

	/**
	 * @example "/react"
	 */
	pathName: string;

	cssOnly?: boolean;

	error: (message: string) => never;
}) => {
	const { manifest, pathName, cssOnly, error } = options;

	let chunk: ManifestChunk | undefined;

	// find chunk
	for (const [id, value] of Object.entries(manifest)) {
		if (chunk) break;

		const noEnding = toPosix(
			path.join(dirNames.src.client, pathName, fileNames.script),
		);

		// id is like this: "client/react/+script.tsx"
		// remove leading / , try all endings
		for (const idPath of toAllScriptEndings(noEnding)) {
			if (chunk) break;

			if (id === idPath) {
				chunk = value;
			}
		}
	}

	if (!chunk) {
		error(`No tags found in manifest for \`${pathName}\``);
		return [];
	}

	const tags: TagDescriptor[] = [];

	if (!cssOnly) {
		// push the entry file name
		// not needed for `imports`, they are already linked in the code
		tags.push({
			tag: "script",
			attrs: { type: "module", src: `/${chunk.file}` },
		});
	}

	if (chunk.css) {
		// need to also do this for `imports` since css does not actually link in the code
		for (const cssFile of chunk.css) {
			tags.push({
				tag: "link",
				attrs: { rel: "stylesheet", href: `/${cssFile}` },
			});
		}
	}

	if (chunk.imports) {
		// recursively call on imports
		for (const imp of chunk.imports) {
			tags.push(
				...getTagsForEntry({ manifest, pathName: imp, cssOnly: true, error }),
			);
		}
	}

	return tags;
};

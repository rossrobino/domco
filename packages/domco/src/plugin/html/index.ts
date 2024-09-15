import { dirNames, fileNames } from "../../constants/index.js";
import type { Handler, Prerender } from "../../types/public/index.js";
import { codeSize } from "../../util/code-size/index.js";
import { findFiles, toPosix } from "../../util/fs/index.js";
import { getMaxLengths } from "../../util/get-max-lengths/index.js";
import { style } from "../../util/style/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import url from "node:url";
import type { Plugin } from "vite";

type StaticFile = { path: string; kB: string; gzip: string };

export const htmlPlugin = (): Plugin => {
	let ssr: boolean | undefined;

	return {
		name: "domco:html-prerender",

		config(_, { isSsrBuild }) {
			ssr = isSsrBuild;
		},

		async writeBundle() {
			if (ssr) {
				const [staticFiles] = await Promise.all([
					generateStatic(),
					removeHtml(),
				]);

				if (staticFiles.length) {
					console.log(style.bold("static"));

					staticFiles.sort((a, b) => a.path.localeCompare(b.path));

					const maxLengths = getMaxLengths(staticFiles);

					for (const file of staticFiles) {
						const filePath = file.path.padEnd((maxLengths.path ?? 0) + 2);
						const kB = file.kB.padStart(maxLengths.kB ?? 0) + " kB";
						const gzip = ` │ gzip: ${file.gzip.padStart(maxLengths.gzip ?? 0)} kB`;

						console.log(`${filePath}${style.dim(kB + gzip)}`);
					}

					console.log();
				}
			}
		},
	};
};

const removeHtml = async () => {
	const pageFiles = await findFiles({
		dir: `${dirNames.out.base}/${dirNames.out.client.base}`,
		checkEndings: [fileNames.page],
	});

	const promises = [];

	for (const filePath of Object.values(pageFiles)) {
		promises.push(
			fs.rm(path.join(process.cwd(), filePath), { recursive: true }),
		);
	}

	await Promise.all(promises);
};

/**
 * Requests pages for static prerender paths provided by the user.
 *
 * Used at build time.
 */
const generateStatic = async () => {
	let { default: handler, prerender } = (await import(
		/* @vite-ignore */
		url.pathToFileURL(
			path.join(
				process.cwd(),
				dirNames.out.base,
				dirNames.out.ssr,
				fileNames.out.entry.app,
			),
		).href
	)) as { default: Handler; prerender: Prerender };

	const staticFiles: StaticFile[] = [];

	if (prerender) {
		const generate = async (routePath: string) => {
			const res = await handler(
				new Request(new URL(`http://0.0.0.0:4545${toPosix(routePath)}`)),
			);

			if (res.status === 404) {
				throw new Error(
					`Prerendering failed for path \`${routePath}\` | 404 - not found.`,
				);
			}

			const code = await res.text();

			const outDir = path.join(dirNames.out.base, dirNames.out.client.base);

			const outDirPath = path.join(process.cwd(), `${outDir}${routePath}`);

			await fs.mkdir(outDirPath, { recursive: true });
			await fs.writeFile(`${outDirPath}/index.html`, code, "utf-8");

			const { kB, gzip } = codeSize(code);

			staticFiles.push({
				path: toPosix(
					`${style.dim(outDir + "/")}${style.green(
						routePath.slice(1) +
							(routePath === "/" || routePath === "" ? "" : "/") +
							"index.html",
					)}`,
				),
				kB,
				gzip,
			});
		};

		if (prerender === true) {
			prerender = ["/"];
		}

		const promises = [];

		for (let staticPath of prerender) {
			if (!staticPath.startsWith("/")) {
				throw Error(
					`Prerender path \`${staticPath}\` does not start with \`"/"\`.`,
				);
			}

			promises.push(generate(staticPath));
		}

		await Promise.all(promises);
	}

	return staticFiles;
};

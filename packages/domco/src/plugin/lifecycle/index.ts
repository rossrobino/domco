import { dirNames, fileNames } from "../../constants/index.js";
import type { Adapter, AppModule, Handler } from "../../types/index.js";
import { codeSize } from "../../util/code-size/index.js";
import { findFiles, toPosix } from "../../util/fs/index.js";
import { getMaxLengths } from "../../util/get-max-lengths/index.js";
import { getTime } from "../../util/perf/index.js";
import { style } from "../../util/style/index.js";
import { version } from "../../version/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import url from "node:url";
import { build, type Plugin } from "vite";

/**
 * Runs logs and scripts throughout the build lifecycle.
 *
 * @param adapter
 * @returns vite plugin
 */
export const lifecyclePlugin = (adapter?: Adapter): Plugin => {
	let ssr: boolean | undefined;

	/** If prerender script should be run. */
	let shouldPrerender = false;

	return {
		name: "domco:lifecycle",
		apply: "build",
		async config(_config, { isSsrBuild }) {
			ssr = isSsrBuild;
		},

		writeBundle(_options, bundle) {
			if (ssr) {
				const appChunk = bundle[fileNames.out.entry.app];

				if (appChunk?.type === "chunk") {
					// Only prerender if there's a named export "prerender" from app chunk.
					// This prevents having to import the app if it is not needed for prerendering.
					shouldPrerender = appChunk.exports.includes("prerender");
				}
			}
		},

		async closeBundle() {
			if (!ssr) {
				console.log();

				// initiate SSR build
				await build({
					build: {
						ssr: true,
					},
				});
			} else {
				const tasks: Promise<any>[] = [removeHtml()];

				if (shouldPrerender) tasks.push(prerender());

				await Promise.all(tasks);

				console.log();

				if (adapter) await runAdapter(adapter);

				console.log(
					style.italic(
						style.dim(
							"run `vite preview` to preview your app with Vite and Node.js.",
						),
					),
				);
				console.log();
			}
		},
	};
};

const domcoTag = style.cyan(`domco v${version}`);

/**
 * Removes all of the `+page.html` files from the build, since the app entry will
 * contain what it needs from virtual module imports.
 */
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
 * Executes `adapter.run` and logs.
 * @param adapter
 */
const runAdapter = async (adapter: Adapter) => {
	const adapterStart = performance.now();

	console.log(
		`${domcoTag} ${style.green(`running ${adapter.name} adapter...`)}`,
	);

	if (adapter.run) {
		await adapter.run();
	}

	console.log(`${style.green("✓")} adapter executed.`);

	console.log(style.dim(adapter.message));

	console.log(
		style.green(`✓ ran in ${getTime(adapterStart, performance.now())}`),
	);

	console.log();
};

type StaticFile = { path: string; kB: string; gzip: string; time: string };

/** Prerenders static routes provided by the user's `prerender` export. */
const prerender = async () => {
	console.log();

	const prerenderStart = performance.now();

	console.log(`${domcoTag} ${style.green("prerendering static pages...")}`);

	let { handler, prerender } = (await import(
		/* @vite-ignore */
		url.pathToFileURL(
			path.join(
				// process.cwd(),
				dirNames.out.base,
				dirNames.out.ssr,
				fileNames.out.entry.app,
			),
		).href
	)) as AppModule;

	console.log(
		style.dim(
			`imported production app in ${getTime(prerenderStart, performance.now())}`,
		),
	);

	if (!prerender) return;

	const staticFilePromises: Promise<StaticFile>[] = [];

	for (const staticPath of prerender) {
		if (!staticPath.startsWith("/")) {
			throw Error(
				`Prerender path \`${staticPath}\` does not start with \`"/"\`.`,
			);
		}

		staticFilePromises.push(generateRoute(staticPath, handler));
	}

	// Generate static files in parallel.
	const staticResults = await Promise.allSettled(staticFilePromises);

	const staticFiles: StaticFile[] = [];
	let failureReasons = "";

	for (const result of staticResults) {
		if (result.status === "fulfilled") {
			staticFiles.push(result.value);
		} else {
			failureReasons += `${result.reason}\n`;
		}
	}

	if (failureReasons) {
		throw new Error(
			`The following errors occurred during prerendering:\n\n${failureReasons}`,
		);
	}

	if (staticFiles?.length) {
		console.log(
			`${style.green("✓")} ${staticFiles.length} page${staticFiles.length > 1 ? "s" : ""} generated.`,
		);

		// Sort alphabetically for logs.
		staticFiles.sort((a, b) => a.path.localeCompare(b.path));

		const maxLengths = getMaxLengths(staticFiles);

		for (const file of staticFiles) {
			const filePath = file.path.padEnd((maxLengths.path ?? 0) + 2);
			const kB = file.kB.padStart(maxLengths.kB ?? 0) + " kB";
			const gzip = ` │ gzip: ${file.gzip.padStart(maxLengths.gzip ?? 0)} kB │ `;
			const time = file.time.padStart(maxLengths.time ?? 0);

			console.log(
				`${filePath}${style.dim(style.bold(kB))}${style.dim(gzip)}${style.dim(time)}`,
			);
		}

		console.log(
			style.green(
				`✓ prerendered in ${getTime(prerenderStart, performance.now())}`,
			),
		);
	}
};

/**
 * Adding this as a separate function enables generating all of the pages
 * in parallel.
 *
 * @param staticPath path to prerender
 * @param handler request handler
 * @returns Information about the prerendered files.
 */
const generateRoute = async (
	staticPath: string,
	handler: Handler,
): Promise<StaticFile> => {
	const startTime = performance.now();

	const res = await handler(
		new Request(`http://0.0.0.0:4545${toPosix(staticPath)}`),
	);

	if (res.status === 404) {
		throw new Error(
			`Prerender failed for path \`${staticPath}\` | 404 - not found.`,
		);
	}

	const code = await res.text();

	const outDir = path.join(dirNames.out.base, dirNames.out.client.base);

	const outDirPath = path.join(process.cwd(), `${outDir}${staticPath}`);

	await fs.mkdir(outDirPath, { recursive: true });
	await fs.writeFile(`${outDirPath}/index.html`, code, "utf-8");

	const { kB, gzip } = codeSize(code);

	return {
		path: toPosix(
			`${style.dim(outDir + "/")}${style.green(
				staticPath.slice(1) +
					(staticPath === "/" || staticPath === "" ? "" : "/") +
					"index.html",
			)}`,
		),
		kB,
		gzip,
		time: getTime(startTime, performance.now()),
	};
};

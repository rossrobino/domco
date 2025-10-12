/**
 * @module prerender
 *
 * Child process that is called from the lifecycle plugin.
 *
 * Implemented as a child process so that if the user's server has a long running
 * process that is started during prerendering, it will not cause the build to hang.
 */
import { dirNames, fileNames } from "../../constants/index.js";
import type { FetchHandler } from "../../types/index.js";
import { codeSize } from "../../util/code-size/index.js";
import { toPosix } from "../../util/fs/index.js";
import { getMaxLengths } from "../../util/get-max-lengths/index.js";
import { getTime } from "../../util/perf/index.js";
import { style } from "../../util/style/index.js";
import { validateEntry } from "../../util/validate-entry/index.js";
import { version } from "../../version/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import url from "node:url";

type StaticFile = { path: string; kB: string; gzip: string; time: string };

/**
 * Adding this as a separate function enables generating all of the pages
 * in parallel.
 *
 * @param staticPath path to prerender
 * @param fetchHandler request handler
 * @returns Information about the prerendered files.
 */
const generateRoute = async (
	staticPath: string,
	fetchHandler: FetchHandler,
): Promise<StaticFile> => {
	const startTime = performance.now();

	const res = await fetchHandler(
		new Request(`http://0.0.0.0:4545${staticPath}`),
	);

	if (res.status === 404) {
		throw new Error(
			`Prerender failed for path \`${staticPath}\` | 404 - not found.`,
		);
	}

	const code = await res.text();

	const outDirBase = path.join(dirNames.out.base, dirNames.out.client.base);

	if (!path.basename(staticPath).includes(".")) {
		// Does not have extension, add `/index.html`.
		staticPath = path.join(staticPath, "index.html");
	}

	const outPath = path.join(process.cwd(), outDirBase, staticPath);

	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await fs.writeFile(outPath, code, "utf-8");

	const { kB, gzip } = codeSize(code);

	let styled = style.dim(outDirBase + "/");

	if (staticPath.endsWith("css")) {
		styled += style.magenta(staticPath.slice(1));
	} else if (staticPath.endsWith("js")) {
		styled += style.cyan(staticPath.slice(1));
	} else {
		styled += style.green(staticPath.slice(1));
	}

	return {
		path: toPosix(styled),
		kB,
		gzip,
		time: getTime(startTime, performance.now()),
	};
};

/** Prerenders static routes provided by the user's `default.prerender` export. */
const prerender = async () => {
	console.log();

	const prerenderStart = performance.now();

	console.log(
		`${style.cyan(`domco v${version}`)} ${style.green("prerendering static pages...")}`,
	);

	const entryPath = url.pathToFileURL(
		path.join(dirNames.out.base, dirNames.out.ssr, fileNames.out.entry.app),
	).href;

	const app = validateEntry(
		await import(
			/* @vite-ignore */
			entryPath
		).catch((error) => {
			console.error(`Error: Failed to import: ${entryPath}`);
			console.error(error);

			return { default: { fetch: () => {} } };
		}),
	);

	if (!app.prerender) {
		console.log("no prerender paths provided.");
		return;
	}

	console.log(
		style.dim(
			`imported application in ${getTime(prerenderStart, performance.now())}`,
		),
	);

	if (typeof app.prerender === "function") {
		app.prerender = await app.prerender();
	}

	if (app.prerender instanceof Set) {
		// convert to array (can't sort a set)
		app.prerender = Array.from(app.prerender);
	}

	// sort for logs
	app.prerender.sort();

	const staticFilePromises: Promise<StaticFile>[] = [];

	for (const staticPath of app.prerender) {
		if (!staticPath.startsWith("/")) {
			throw Error(
				`Prerender path \`${staticPath}\` does not start with \`"/"\`.`,
			);
		}

		staticFilePromises.push(generateRoute(staticPath, app.fetch));
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
			`${style.green("✓")} ${staticFiles.length} file${staticFiles.length > 1 ? "s" : ""} generated.`,
		);

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

await prerender();

process.exit(); // exit child process

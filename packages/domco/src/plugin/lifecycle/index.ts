import { dirNames, fileNames } from "../../constants/index.js";
import type { Adapter } from "../../types/index.js";
import {
	copyDir,
	findFilePaths,
	removeDir,
	removeEmptyDirs,
} from "../../util/fs/index.js";
import { getTime } from "../../util/perf/index.js";
import { style } from "../../util/style/index.js";
import { version } from "../../version/index.js";
import { fork } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { type Plugin, build } from "vite";

/**
 * Runs logs and scripts throughout the build lifecycle.
 *
 * @param adapter
 * @returns vite plugin
 */
export const lifecyclePlugin = (adapter?: Adapter): Plugin => {
	let ssr: boolean | undefined;

	return {
		name: "domco:lifecycle",
		apply: "build",
		async config(_config, { isSsrBuild }) {
			ssr = isSsrBuild;
		},

		async closeBundle() {
			if (!ssr) {
				console.log();

				// initiate SSR build
				await build({ build: { ssr: true } });
			} else {
				const outDir = `${dirNames.out.base}/${dirNames.out.client.base}`;
				const pageDir = path.join(outDir, dirNames.src.client);
				const clientAssetDir = path.join(outDir, dirNames.out.client.immutable);
				const ssrAssetDir = path.join(
					dirNames.out.base,
					dirNames.out.ssr,
					dirNames.out.client.immutable,
				);

				await Promise.all([
					removeHtml(pageDir),
					// copy ssr assets into client asset dir to serve
					// https://vite.dev/config/build-options.html#build-emitassets
					copyDir(ssrAssetDir, clientAssetDir),
				]);

				await Promise.all([
					removeDir(ssrAssetDir), // remove the ssr assets dir since it has been copied into client
					removeEmptyDirs(pageDir),
				]);

				const prerenderProcess = fork(
					path.join(import.meta.dirname, "prerender.process.js"),
					{ stdio: "inherit" },
				);

				prerenderProcess.on("exit", async () => {
					console.log();

					if (adapter) await runAdapter(adapter);

					console.log(
						style.italic(
							style.dim("run `vite preview` to test your production build"),
						),
					);

					console.log();
				});
			}
		},
	};
};

/**
 * Removes all of the `+page.html` files from the build, since the function entry will
 * contain what it needs from virtual module imports.
 */
const removeHtml = async (dir: string) => {
	let pageFiles: string[];

	try {
		pageFiles = await findFilePaths({ dir, checkEndings: [fileNames.page] });
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT" &&
			"path" in error &&
			error.path === dir
		) {
			return;
		}

		throw error;
	}

	await Promise.all(pageFiles.map((filePath) => fs.unlink(filePath)));
};

/**
 * Executes `adapter.run` and logs.
 * @param adapter
 */
const runAdapter = async (adapter: Adapter) => {
	const adapterStart = performance.now();

	console.log(
		`${style.cyan(`domco v${version}`)} ${style.green(`running ${adapter.name} adapter...`)}`,
	);

	try {
		if (adapter.run) await adapter.run();
	} catch (error) {
		console.error(`Error: Failed to run ${adapter.name} adapter`);
		console.error(error);
	}

	console.log(`${style.green("✓")} adapter executed.`);

	console.log(style.dim(adapter.message));

	console.log(
		style.green(`✓ ran in ${getTime(adapterStart, performance.now())}`),
	);

	console.log();
};

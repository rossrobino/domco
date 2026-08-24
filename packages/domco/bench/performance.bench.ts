import {
	findFile,
	findFilePaths,
	findFiles,
	removeEmptyDirs,
	toAllScriptEndings,
} from "../src/util/fs/index.js";
import { resolveChunk } from "../src/util/manifest/index.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Manifest } from "vite";
import { afterAll, beforeAll, bench, describe } from "vitest";

const manifest: Manifest = {};

for (let i = 0; i < 5_000; i++) {
	manifest[`client/route-${i}/+script.ts`] = { file: `route-${i}.js` };
}

const scriptNames = toAllScriptEndings("+script");
let root = "";
let route = "";
let output = "";
let pages = "";

beforeAll(async () => {
	root = await fs.mkdtemp(path.join(os.tmpdir(), "domco-performance-"));

	await Promise.all(
		Array.from({ length: 80 }, async (_, i) => {
			const dir = path.join(root, `route-${i}`);
			await fs.mkdir(dir);
			await Promise.all([
				fs.writeFile(path.join(dir, "+page.html"), ""),
				fs.writeFile(path.join(dir, "+script.ts"), ""),
				fs.writeFile(path.join(dir, "+style.css"), ""),
				...Array.from({ length: 8 }, (_, i) =>
					fs.writeFile(path.join(dir, `module-${i}.ts`), ""),
				),
			]);
		}),
	);

	route = path.join(root, "route-79");

	output = await fs.mkdtemp(path.join(os.tmpdir(), "domco-output-"));
	pages = path.join(output, "client");

	await Promise.all([
		...Array.from({ length: 80 }, async (_, i) => {
			const dir = path.join(pages, `route-${i}`);
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(path.join(dir, "+page.html"), "");
		}),
		...Array.from({ length: 100 }, async (_, i) => {
			const dir = path.join(output, "_immutable", `chunk-${i}`);
			await fs.mkdir(dir, { recursive: true });
			await Promise.all(
				Array.from({ length: 12 }, (_, i) =>
					fs.writeFile(path.join(dir, `asset-${i}.js`), ""),
				),
			);
		}),
	]);
});

afterAll(async () => {
	await Promise.all(
		[root, output].map((dir) => fs.rm(dir, { recursive: true, force: true })),
	);
});

const legacyRemoveEmptyDirs = async (dir: string): Promise<void> => {
	const stats = await fs.lstat(dir);
	if (!stats.isDirectory()) return;

	let files = await fs.readdir(dir);

	if (files.length > 0) {
		await Promise.all(
			files.map((file) => legacyRemoveEmptyDirs(path.join(dir, file))),
		);
		files = await fs.readdir(dir);
	}

	if (files.length === 0) await fs.rmdir(dir);
};

describe("development entry lookup", () => {
	bench("target-directory lookup", async () => {
		await findFile(route, scriptNames);
	});

	bench("recursive client-tree scan", async () => {
		await findFiles({ dir: root, checkEndings: scriptNames });
	});
});

describe("client build entry discovery", () => {
	bench("one combined tree walk", async () => {
		await findFilePaths({
			dir: root,
			checkEndings: ["+page.html", ...scriptNames, "+style.css"],
		});
	});

	bench("three separate tree walks", async () => {
		await Promise.all([
			findFiles({ dir: root, checkEndings: ["+page.html"] }),
			findFiles({ dir: root, checkEndings: scriptNames }),
			findFiles({ dir: root, checkEndings: ["+style.css"] }),
		]);
	});
});

describe("build output cleanup", () => {
	bench("directory-entry cleanup", async () => {
		await removeEmptyDirs(root);
	});

	bench("per-file stat cleanup", async () => {
		await legacyRemoveEmptyDirs(root);
	});
});

describe("generated page cleanup scope", () => {
	bench("page output subtree", async () => {
		await findFilePaths({ dir: pages, checkEndings: ["+page.html"] });
		await removeEmptyDirs(pages);
	});

	bench("entire client output", async () => {
		await findFilePaths({ dir: output, checkEndings: ["+page.html"] });
		await removeEmptyDirs(output);
	});
});

describe("production manifest entry lookup", () => {
	bench("direct lookup", () => {
		void resolveChunk(manifest, "/route-4999", "script");
	});

	bench("linear manifest scan", () => {
		for (const id of Object.keys(manifest)) {
			if (id === "client/route-4999/+script.ts") break;
		}
	});
});

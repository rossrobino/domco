import {
	copyDir,
	findFile,
	findFilePaths,
	findFiles,
	removeEmptyDirs,
	toAllScriptEndings,
	toPosix,
} from "./index.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(
		tempDirs
			.splice(0)
			.map((dir) => fs.rm(dir, { recursive: true, force: true })),
	);
});

describe("fs tests", () => {
	test("findFiles", async () => {
		const files = await findFiles({
			dir: "packages",
			checkEndings: ["test.ts"],
		});

		expect(files).toHaveProperty("/domco/src/util/fs");

		for (const [k, v] of Object.entries(files)) {
			const keyCheck = v.startsWith("/") || v.startsWith("\\");
			expect(keyCheck).toBe(true);
			const valCheck = k.startsWith("/") || k.startsWith("\\");
			expect(valCheck).toBe(true);
		}
	});

	test("toAllScriptEndings", () => {
		const endings = toAllScriptEndings("script");
		expect(endings).toStrictEqual([
			"script.js",
			"script.ts",
			"script.jsx",
			"script.tsx",
		]);
	});

	test("toPosix", () => {
		expect(toPosix("\\test/path\\index.ts")).toBe("/test/path/index.ts");
	});

	test("findFile checks only the target directory in preference order", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "domco-find-file-"));
		tempDirs.push(root);

		const route = path.join(root, "route");
		await fs.mkdir(route);
		await Promise.all([
			fs.writeFile(path.join(route, "+script.ts"), ""),
			fs.writeFile(path.join(route, "+script.tsx"), ""),
		]);

		expect(await findFile(route, toAllScriptEndings("+script"))).toBe(
			path.join(route, "+script.ts"),
		);
		expect(
			await findFile(path.join(root, "missing"), ["+script.ts"]),
		).toBeUndefined();
	});

	test("findFilePaths keeps colocated entries and skips excluded trees", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "domco-find-paths-"));
		tempDirs.push(root);

		await Promise.all([
			fs.mkdir(path.join(root, "route"), { recursive: true }),
			fs.mkdir(path.join(root, "dist", "nested"), { recursive: true }),
		]);
		await Promise.all([
			fs.writeFile(path.join(root, "route", "+page.html"), ""),
			fs.writeFile(path.join(root, "route", "+script.ts"), ""),
			fs.writeFile(path.join(root, "route", "+style.css"), ""),
			fs.writeFile(path.join(root, "dist", "nested", "+page.html"), ""),
		]);

		const files = await findFilePaths({
			dir: root,
			checkEndings: ["+page.html", "+script.ts", "+style.css"],
		});

		expect(files.map((file) => path.basename(file)).sort()).toStrictEqual([
			"+page.html",
			"+script.ts",
			"+style.css",
		]);
	});

	test("removeEmptyDirs avoids walking files and preserves populated trees", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "domco-empty-dirs-"));
		tempDirs.push(root);

		await Promise.all([
			fs.mkdir(path.join(root, "empty", "nested"), { recursive: true }),
			fs.mkdir(path.join(root, "full", "empty"), { recursive: true }),
		]);
		await fs.writeFile(path.join(root, "full", "file.txt"), "");

		await removeEmptyDirs(root);

		await expect(fs.access(path.join(root, "empty"))).rejects.toThrow();
		await expect(fs.access(path.join(root, "full"))).resolves.toBeUndefined();
		await expect(fs.access(path.join(root, "full", "empty"))).rejects.toThrow();
	});

	test("copyDir skips a missing source without a separate existence check", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "domco-copy-dir-"));
		tempDirs.push(root);

		const source = path.join(root, "source");
		const destination = path.join(root, "destination");

		await expect(copyDir(source, destination)).resolves.toBeUndefined();

		await fs.mkdir(source);
		await fs.writeFile(path.join(source, "file.txt"), "copied");
		await copyDir(source, destination);

		expect(await fs.readFile(path.join(destination, "file.txt"), "utf-8")).toBe(
			"copied",
		);
	});

	test("removeEmptyDirs skips a missing root", async () => {
		await expect(removeEmptyDirs("does-not-exist")).resolves.toBeUndefined();
	});
});

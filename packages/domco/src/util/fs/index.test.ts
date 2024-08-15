import { fileExists, findFiles, toAllScriptEndings, toPosix } from "./index.js";
import { describe, expect, test } from "vitest";

describe("fs tests", () => {
	test("findFiles", async () => {
		const files = await findFiles({
			dir: "src",
			checkEndings: ["test.ts"],
		});

		expect(files).toHaveProperty("/util/fs");

		for (const [k, v] of Object.entries(files)) {
			const keyCheck = v.startsWith("/") || v.startsWith("\\");
			expect(keyCheck).toBe(true);
			const valCheck = k.startsWith("/") || k.startsWith("\\");
			expect(valCheck).toBe(true);
		}
	});

	test("fileExists", async () => {
		expect(await fileExists("package.json")).toBeTruthy();
		expect(await fileExists("does-not-exist.json")).toBeFalsy();
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
});

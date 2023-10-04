import { expect, test } from "bun:test";
import { fileExists } from "./index.js";

test("files should exist", async () => {
	expect(await fileExists("package.json")).toEqual(true);
	expect(await fileExists("src/index.ts")).toEqual(true);
});

test("file should not exist", async () => {
	expect(await fileExists("doesNotExist.json")).toEqual(false);
});

import { expect, test } from "bun:test";
import { fileExists } from ".";

test("exists", async () => {
	expect(await fileExists("package.json")).toEqual(true);
	expect(await fileExists("src/index.ts")).toEqual(true);
});

test("does not exist", async () => {
	expect(await fileExists("doesNotExist.json")).toEqual(false);
});

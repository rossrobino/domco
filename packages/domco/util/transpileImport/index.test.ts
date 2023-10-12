import { expect, test } from "bun:test";
import { transpileImport } from "./index.js";
import path from "node:path";

test("transpile and import domco", async () => {
	const filePath = path.join(process.cwd(), "index.ts");

	const { addBlocks } = await transpileImport<{ addBlocks: () => any }>(
		filePath,
	);

	expect(addBlocks).toBeFunction();
});

import { expect, test } from "bun:test";
import { transpileImport } from "./index.js";
import path from "node:path";
import type { PluginOption } from "vite";

test("transpile and import domco", async () => {
	const filePath = path.join(process.cwd(), "src", "index.ts");

	console.log(path.join(process.cwd()));
	const { domco } = await transpileImport<{ domco: () => PluginOption }>(
		filePath,
	);

	expect(domco).toBeFunction();
});

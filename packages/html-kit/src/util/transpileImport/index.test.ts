import { test } from "bun:test";
import { transpileImport } from "./index";
import path from "node:path";
import type { PluginOption } from "vite";

test("transpile and import entry", async () => {
	const filePath = path.join(process.cwd(), "src", "index.ts");

	console.log(path.join(process.cwd()));
	const { htmlKit } = await transpileImport<{ htmlKit: () => PluginOption }>(
		filePath,
	);
	console.log(htmlKit.toString());
});

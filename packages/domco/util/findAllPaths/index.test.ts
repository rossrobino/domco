import { expect, test } from "bun:test";
import { findAllPaths } from "./index.js";
import path from "node:path";

test("find index.ts files", async () => {
	const paths = await findAllPaths({
		dirPath: path.join("./"),
		fileName: "index.ts",
	});
	expect(paths).toBeDefined();
	expect(paths["../../types"]).toBeString();
});

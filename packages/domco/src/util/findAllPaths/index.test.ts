import { expect, test } from "bun:test";
import { findAllPaths } from "./index";
import path from "node:path";

test("find index.ts files", async () => {
	const paths = await findAllPaths({
		dirPath: path.join("src"),
		fileName: "index.ts",
	});
	expect(paths).toBeDefined();
	expect(paths["../types"]).toBeString();
});

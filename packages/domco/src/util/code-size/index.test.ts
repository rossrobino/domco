import { codeSize } from "./index.js";
import { expect, test } from "vitest";

test("code size", () => {
	const size = codeSize("hello world.");
	expect(size).toHaveProperty("kB");
	expect(size).toHaveProperty("gzip");
});

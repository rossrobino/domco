import { getMaxLengths } from "./index.js";
import { describe, expect, test } from "vitest";

describe("getMaxLengths", () => {
	test("check lengths", () => {
		const arr = [
			{ a: "foo", b: "bar" },
			{ a: "foobar", b: "z" },
		];
		const lens = getMaxLengths(arr);
		expect(lens.a).toBe(6);
		expect(lens.b).toBe(3);
	});
});

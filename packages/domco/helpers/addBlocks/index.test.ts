import { expect, test } from "bun:test";
import { addBlocks } from "./index.js";
import type { Block } from "../../index.js";

const block1: Block = async () => {
	const startTime = Date.now();
	await new Promise((resolve) => setTimeout(resolve, 50));
	const endTime = Date.now();
	return endTime - startTime;
};

const block2: Block = async () => {
	const startTime = Date.now();
	await new Promise((resolve) => setTimeout(resolve, 30));
	const endTime = Date.now();
	return endTime - startTime;
};

const block3: Block = async (_, data) => {
	return data;
};

test("addBlocks should run blocks asynchronously", async () => {
	const mockWindow = {} as Window & typeof globalThis;

	const startTime = Date.now();

	const result = await addBlocks(mockWindow, [
		block1,
		block2,
		{ block: block3, data: "result3" },
	]);

	const endTime = Date.now();

	// console.log(result);
	// console.log(result, endTime - startTime); // should be just over 500ms

	expect(result).toEqual([
		{ status: "fulfilled", value: expect.any(Number) },
		{ status: "fulfilled", value: expect.any(Number) },
		{ status: "fulfilled", value: "result3" },
	]);

	expect(endTime - startTime).toBeGreaterThanOrEqual(50);
	expect(endTime - startTime).toBeLessThanOrEqual(60);
});

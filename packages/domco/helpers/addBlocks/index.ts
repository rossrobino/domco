import type { Block } from "../../types/index.js";

/**
 * A helper function that runs an array of blocks asynchronously
 * with `Promise.allSettled`, passing the `window` and optionally
 * `data` into each block
 *
 * @param window the `Window` object to be passed into each block
 * @param blocks an array of blocks
 * @returns an array containing the results of each block
 *
 * @example
 * ```ts
 * // src/index.build.ts
 * import { type Build, addBlocks } from "domco";
 * import { myBlock, anotherBlock } from "$lib/blocks/myBlocks";
 *
 * export const build: Build = async (window) => {
 *     const results = await addBlocks(window, [myBlock, anotherBlock]);
 * }
 * ```
 */
export const addBlocks = async (
	window: Window & typeof globalThis,
	blocks: (
		| { block: Block<any>; data: Parameters<Block<any>>[1] }
		| Block<any>
	)[],
) => {
	const result = await Promise.allSettled(
		blocks.map((block) => {
			if (typeof block === "function") {
				return block(window);
			} else {
				const { block: func, data } = block;
				return func(window, data);
			}
		}),
	);
	return result;
};

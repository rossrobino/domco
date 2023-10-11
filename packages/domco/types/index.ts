/**
 * - utilized in `index.build` or `layout.build` files.
 * - export a `build` function from these files to run it at build time
 * on the corresponding `.html` pages.
 *
 * @param window a `Window` object representing `./index.html`
 * @param context context about the current route
 *
 * @example
 * ```ts
 * // src/routes/index.build.ts
 * import type { Build } from "domco";
 *
 * export const build: Build = async ({ document }) => {
 *     // modify the contents of `./index.html`
 *
 *     const el = document.querySelector("#id");
 *     el.textContent = "Rendered on the server.";
 * }
 * ```
 */
export type Build = (
	window: Window & typeof globalThis,
	context: BuildContext,
) => Promise<any>;

/** context about the current page to utilize during the build */
export interface BuildContext {
	/** current route */
	route: {
		/** unresolved route: `/posts/[slug]` */
		id: string;
		/** resolved route with params: `/posts/my-post` */
		url: string;
	};
	/**
	 * the current routes parameters
	 *
	 * given the file `src/routes/posts/[slug]/index.build.ts`
	 *
	 * `params` would be `{ slug: "my-post" }`
	 */
	params: Record<string, string>;
}

/**
 * - import and utilize a block inside of a `Build` function
 * - wrapper function to provide the `window` in other imported modules
 *
 * @param window a `Window` object representing the `./index.html` file of the `index.build` page where the function is being run
 * @param data an object containing data to pass into the function
 *
 * @example
 * ```ts
 * // src/lib/blocks/myBlock
 * export const myBlock: Block = async ({ document }) => {
 *     // modify the document
 * }
 *
 * // src/routes/index.build.ts
 * import { type Build, addBlocks } from "domco";
 * import { myBlock } from "$lib/blocks/myBlock";
 *
 * export const build: Build = async (window) => {
 *     await myBlock(window);
 *
 *     // or alternatively if you have many blocks
 *     await addBlocks(window, [myBlock, ...]);
 * }
 * ```
 */
export type Block = (
	window: Window & typeof globalThis,
	data?: any,
) => Promise<any>;

export type Generated = {
	/** files to add at the end of the build */
	add: { fileName: string; source: string }[];
	/** directory to delete at the end of the build */
	delete: string;
};

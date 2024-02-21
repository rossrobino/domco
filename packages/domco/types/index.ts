import type { DOMWindow } from "jsdom";

export type Build<P extends Params = Params> = (
	/**
	 * `Window` created from `./index.html`.
	 */
	window: DOMWindow,

	/**
	 * Context about the current route.
	 */
	context: BuildContext<P[number]>,
) => any;

/** Context about the current page to utilize during the build. */
export type BuildContext<P> = {
	/** The route as a string, for example: `/posts/[slug]/` */
	route: string;

	/**
	 * The current route's parameters.
	 *
	 * @example { slug: "my-post" }
	 */
	params: P;
};

/**
 * - Import and utilize a block inside of a `Build` function
 * - Wrapper function to provide the `window` in other imported modules
 *
 * @example
 * ```ts
 * // src/lib/blocks/myBlock.ts
 * import type { Block } from "domco";
 *
 * export const myBlock: Block = async ({ document }) => {
 *     // modify the document
 * }
 *
 * // src/+config.ts
 * import { type Config, addBlocks } from "domco";
 * import { myBlock } from "$lib/blocks/myBlock";
 *
 * export const config: Config = {
 * 	build: async (window) => {
 * 		await myBlock(window);
 *
 * 		// or alternatively if you have many blocks
 * 		await addBlocks(window, [myBlock, ...]);
 * 	}
 * };
 * ```
 */
export type Block<D = undefined> = (
	/**
	 * `Window` object representing the `./index.html` file of the `+config` page where the function is being run
	 */
	window: DOMWindow,

	/**
	 * Data to pass into the function.
	 */
	data?: D,
) => any;

export type Params = ReadonlyArray<Record<string, string>>;

export type Config<P extends Params = Params> = {
	/**
	 * - utilized in `+config` files.
	 * - This function runs at build time on the corresponding `.html` pages.
	 *
	 * @example
	 * ```ts
	 * // src/+config.ts
	 * import type { Config } from "domco";
	 *
	 * export const config: Config = {
	 * 	build: async ({ document }) => {
	 * 		// modify the contents of `./index.html`
	 *
	 * 		const p = document.createElement("p");
	 * 		p.textContent = "A server rendered paragraph.";
	 * 		document.body.appendChild(p);
	 * 	}
	 * };
	 * ```
	 */
	build?: Build<P>;

	/**
	 * A `build` function that applies to the current page,
	 * and all nested pages.
	 */
	layoutBuild?: Build<P>;

	/**
	 * String of html with a <slot> to render the content into.
	 */
	layout?: string;

	/**
	 * Provide the possible parameters for the current route.
	 *
	 * @example [{ slug: "my-post" }]
	 */
	params?: P;
};

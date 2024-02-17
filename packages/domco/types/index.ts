import type { DOMWindow } from "jsdom";

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
 * // src/index.build.ts
 * import type { Build } from "domco";
 *
 * export const build: Build = async ({ document }) => {
 *     // modify the contents of `./index.html`
 *
 *     const p = document.createElement("p");
 * 	   p.textContent = "A server rendered paragraph.";
 *     document.body.appendChild(p);
 * }
 * ```
 */
export type Build<P extends Params = Params> = (
	window: DOMWindow,
	context: BuildContext<P[number]>,
) => any;

/** Context about the current page to utilize during the build */
export type BuildContext<P> = {
	/** The route as a string, for example: `/posts/[slug]` */
	route: string;

	/**
	 * The current route's parameters,
	 * given the file `src/posts/[slug]/index.build.ts`,
	 * `params` could be `[{ slug: "my-post" }]`
	 */
	params: P;
};

/**
 * - Import and utilize a block inside of a `Build` function
 * - Wrapper function to provide the `window` in other imported modules
 *
 * @param window a `Window` object representing the `./index.html` file of the `index.build` page where the function is being run
 * @param data data to pass into the function
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
 * // src/index.build.ts
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
export type Block<D = undefined> = (window: DOMWindow, data?: D) => any;

export type Params = ReadonlyArray<Record<string, string>>;

export type Config<P extends Params = Params> = {
	build?: Build<P>;

	layoutBuild?: Build<P>;

	/** String of html with a <slot> to render the content into. */
	layout?: string;

	params?: P;
};

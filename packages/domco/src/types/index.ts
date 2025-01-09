import type { SSRTarget, SSROptions, Connect } from "vite";

/** Helper type for a type that could be a promise. */
export type MaybePromise<T> = T | Promise<T>;

/** Exports from the SSR `+func` entry point. */
export type FuncModule = {
	handler: Handler;
	prerender: Prerender;
};

/**
 * Request handler, takes a web request and returns a web response.
 *
 * ```ts
 * // src/server/+func.ts
 * import type { Handler } from "domco";
 *
 * export const handler: Handler = async (req) => {
 * 	return new Response("Hello world");
 * };
 * ```
 */
export type Handler = (req: Request) => MaybePromise<Response>;

/**
 * Paths to prerender at build time.
 *
 * @example
 *
 * ```ts
 * // src/server/+func.ts
 * import type { Prerender } from "domco";
 *
 * export const prerender: Prerender = ["/", "/post-1", "/post-2"];
 * ```
 */
export type Prerender =
	| Array<string>
	| Set<string>
	| (() => MaybePromise<Array<string> | Set<string>>);

/** Middleware used in the Vite server for dev and preview. */
export type AdapterMiddleware = Connect.NextHandleFunction;

/** A function that returns an additional entry point to include in the SSR build. */
export type AdapterEntry = (AdapterEntryOptions: {
	/** The function entry point to import `handler` from. */
	funcId: string;
}) => {
	/**
	 * The name of the entry point without extension.
	 *
	 * @example "main"
	 */
	id: string;

	/** Code for the entry point. */
	code: string;
};

/** A domco adapter that configures the build to a target production environment. */
export type Adapter = {
	/** The name of the adapter. */
	name: string;

	/** The script to run after Vite build is complete. */
	run?: () => any;

	/** Message to log when the build is complete. */
	message: string;

	/** Entry point for the server application. */
	entry: AdapterEntry;

	/** Passed into Vite `config.ssr.target`. */
	target?: SSRTarget;

	/** Passed into Vite `config.ssr.noExternal`. */
	noExternal?: SSROptions["noExternal"];

	/** Middleware to apply in `dev` mode. */
	devMiddleware?: AdapterMiddleware[];

	/** Middleware to apply in `preview` mode. */
	previewMiddleware?: AdapterMiddleware[];
};

/**
 * Use this type to create your own adapter.
 * Pass any options for the adapter in as a generic.
 */
export type AdapterBuilder<AdapterOptions = never> = (
	AdapterOptions?: AdapterOptions,
) => MaybePromise<Adapter>;

/**
 * domco Config
 *
 * Use if you want to create a separate object for your domco config.
 * Pass the config into the `domco` vite plugin.
 *
 * @example
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { domco, type DomcoConfig } from "domco";
 *
 * const config: DomcoConfig = {
 * 	// options...
 * };
 *
 * export default defineConfig({
 * 	plugins: [domco(config)],
 * });
 * ```
 */
export type DomcoConfig = {
	/**
	 * domco adapter.
	 *
	 * Defaults to `undefined` - creates a `func` build only.
	 *
	 * @default undefined
	 *
	 * @example
	 *
	 * ```js
	 * import { adapter } from `"domco/adapter/...";`
	 * ```
	 */
	adapter?: ReturnType<AdapterBuilder>;
};

/** An object that describes a tag and its children. */
export type TagDescriptor = {
	/**
	 * The tagName of the element.
	 *
	 * @example "h1"
	 */
	name: string;

	/**
	 * The attributes on the tag.
	 *
	 * @example
	 *
	 * These attributes,
	 *
	 * ```js
	 * {
	 * 	class: "text-black",
	 * 	open: true,
	 * }
	 * ```
	 *
	 * would produce the following HTML.
	 *
	 * ```html
	 * <dialog class="text-black" open>...</dialog>
	 * ```
	 */
	attrs?: Record<string, string | boolean | undefined>;

	/** Children of the tag. Tags or a string of HTML. */
	children?: TagInput;
};

/** Tags can be a `string`, a `TagDescriptor`, or an array of `TagDescriptors`. */
export type TagInput = string | TagDescriptor | TagDescriptor[];

/** How to inject tags into the HTML string. */
export type InjectMethod = "append" | "prepend" | "replace";

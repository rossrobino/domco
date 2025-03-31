import type { SSRTarget, SSROptions, Connect } from "vite";

/** Helper type for a type that could be a promise. */
export type MaybePromise<T> = T | Promise<T>;

/** `default` export from the SSR entry point. */
export type App = {
	fetch: FetchHandler;
	prerender?: Prerender;
};

/** Fetch handler, takes a web request and returns a web response. */
export type FetchHandler = (req: Request) => MaybePromise<Response>;

/** Paths to prerender at build time. */
export type Prerender =
	| Array<string>
	| Set<string>
	| (() => MaybePromise<Array<string> | Set<string>>);

/** Middleware used in the Vite server for dev and preview. */
export type AdapterMiddleware = Connect.NextHandleFunction;

/** A function that returns an additional entry point to include in the SSR build. */
export type AdapterEntry = (AdapterEntryOptions: {
	/** SSR entry point to import from. */
	appId: string;
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
 * Pass the config into the `domco` Vite plugin.
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

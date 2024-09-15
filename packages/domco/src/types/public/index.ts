import type { MaybePromise } from "../helper/index.js";
import type { SSRTarget, SSROptions, Connect } from "vite";

export type Handler = (req: Request) => MaybePromise<Response>;

export type AdapterMiddleware = Connect.NextHandleFunction;

export type AdapterEntry = (AdapterEntryOptions: {
	/** The app entrypoint to import `createApp` from. */
	appId: string;
}) => {
	/**
	 * The name of the entrypoint without extension.
	 *
	 * @example "main"
	 */
	id: string;

	/** Code for the entrypoint. */
	code: string;
};

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

	/**
	 * Middleware to apply in `dev` mode.
	 */
	devMiddleware?: AdapterMiddleware[];

	/**
	 * Middleware to apply in `preview` mode.
	 */
	previewMiddleware?: AdapterMiddleware[];
};

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
	 * Defaults to `undefined` - creates a `app` build only.
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

/**
 * Paths to prerender relative to the current route.
 *
 * @example
 *
 * ```ts
 * // src/posts/+server.ts
 * import type { Prerender } from "domco";
 *
 * // prerender current route
 * export const prerender: Prerender = true;
 *
 * // prerender multiple paths relative to the current route.
 * export const prerender: Prerender = ["/", "/post-1", "/post-2"];
 * ```
 */
export type Prerender = Array<string> | true;

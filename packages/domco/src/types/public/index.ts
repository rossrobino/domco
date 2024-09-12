import type { MaybePromise } from "../helper/index.js";
import type { Env, MiddlewareHandler } from "hono";
import type { HonoOptions } from "hono/hono-base";
import type { HtmlEscapedString } from "hono/utils/html";
import type { SSRTarget, ViteDevServer, SSROptions } from "vite";

export type CreateAppMiddleware = {
	/** Path to apply the middleware to. */
	path: string;

	/** The middleware to apply. */
	handler: MiddlewareHandler;
};

export type CreateAppOptions = {
	/** Only used in `dev` to call the server. */
	devServer?: ViteDevServer;

	/** Passthrough options to the Hono app. */
	honoOptions?: HonoOptions<Env>;

	/**
	 * Middleware to be applied before any routes. Useful for adapters that need to
	 * inject middleware.
	 */
	middleware?: CreateAppMiddleware[];
};

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
	 * For production middleware, export it from the adapter module,
	 * and then import into the entry point.
	 */
	devMiddleware?: CreateAppOptions["middleware"];

	/**
	 * Middleware to apply in `preview` mode.
	 * For production middleware, export it from the adapter module,
	 * and then import into the entry point.
	 */
	previewMiddleware?: CreateAppOptions["middleware"];
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

export type Page = (routePath?: string) => string;

export type Client = (routePath?: string) => HtmlEscapedString;

export type Server = (
	pathname: string,
	init?: RequestInit,
) => MaybePromise<Response>;

/**
 * Extend Hono's variable map with domco's.
 *
 * [Hono reference](https://hono.dev/docs/api/context#contextvariablemap)
 *
 * @example
 *
 * ```ts
 * // src/global.d.ts
 * /// <reference types="vite/client" />
 * import type { DomcoContextVariableMap } from "domco";
 * import "hono";
 *
 * declare module "hono" {
 * 	interface ContextVariableMap extends DomcoContextVariableMap {}
 * }
 * ```
 */
export type DomcoContextVariableMap = {
	/**
	 * Any `+page.html` within `src` can be accessed through the `page` context variable.
	 * This provides the HTML after processing by Vite.
	 *
	 * @param routePath
	 *
	 * If `routePath` is left `undefined`, the current route's `./+page.html` will be returned.
	 * Otherwise, you can use an alternative `routePath` to get a different page.
	 *
	 * @returns corresponding string of HTML
	 *
	 * @example
	 *
	 * ```ts
	 * // src/.../+server.(js,ts,jsx,tsx)
	 * import { Hono } from "hono";
	 *
	 * app.get("/", (c) => {
	 * 	// gets `./+page.html`
	 * 	const page = c.var.page();
	 *
	 * 	// gets `src/route/path/+page.html`
	 * 	const differentPage = c.var.page("/route/path")
	 *
	 * 	return c.html(page);
	 * });
	 *
	 * export default app;
	 * ```
	 */
	page: Page;

	/**
	 * The script tags for any `+client.(js,ts,jsx,tsx)` within `src` can be accessed through the `client` context variable.
	 * This is useful if you are wanting to include a client side script but are not using a `page` file for your HTML, since
	 * the names of these tags will be different after your client application has been built.
	 *
	 * For example, if you are using JSX to render the markup for your application you can utilize the `client` variable to include
	 * client side scripts.
	 *
	 * Also, the link tags for any `css` imported into the script will be included.
	 *
	 * In development, the tags will link directly to the script.
	 *
	 * In production, domco will read `dist/client/.vite/manifest.json` and use the hashed file names generated from the build.
	 *
	 * @param routePath
	 *
	 * If `routePath` is left `undefined`, the current route's `./+client.(js,ts,jsx,tsx)` will be returned.
	 * Otherwise, you can use an alternative `routePath` to get a different route's tags.
	 *
	 * @returns the raw script tags to use the client side assets in a response.
	 *
	 * @example
	 *
	 * ```tsx
	 * // HTML example
	 * // src/.../+server.(js,ts,jsx,tsx)
	 *
	 * import { Hono } from "hono";
	 * import { html } from "hono/html";
	 *
	 * const app = new Hono();
	 *
	 * app.get("/", (c) => {
	 * 	// gets `./+client.(js,ts,jsx,tsx)`
	 * 	const tags = c.var.client();
	 *
	 * 	// gets `src/route/path/+client.(js,ts,jsx,tsx)`
	 * 	const differentTags = c.var.client("/route/path")
	 *
	 * 	return c.html(html`
	 * 		${tags}
	 * 		<p>Partial with client side script</p>
	 * 	`);
	 * });
	 *
	 * export default app;
	 *
	 *
	 * // JSX example
	 *
	 * app.get("/", (c) => {
	 * 	return c.html(
	 * 		<>
	 * 			{c.var.client()}
	 * 			<p>Partial with client side script</p>
	 * 		</>
	 * 	`);
	 * });
	 * ```
	 */
	client: Client;

	/**
	 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) with the origin set, pass in the local path instead of the entire `url`.
	 *
	 * @param pathname the local path to request
	 * @param init [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)
	 * @returns [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 * @example
	 *
	 * ```ts
	 * // src/.../+server.(js,ts,jsx,tsx)
	 * import { Hono } from "hono";
	 *
	 * const app = new Hono();
	 *
	 * app.get("/", (c) => {
	 * 	// dev: fetch("http://localhost:5173/route/path")
	 * 	// prod: fetch("https://example.com/route/path")
	 * 	const res = await c.var.server("/route/path")
	 *
	 * 	// ...
	 * });
	 *
	 * export default app;
	 * ```
	 */
	server: Server;
};

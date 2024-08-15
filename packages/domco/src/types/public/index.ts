import type { MaybePromise } from "../helper/index.js";
import type { HtmlEscapedString } from "hono/utils/html";

export type AdapterEntry = (AdapterEntryOptions: {
	/** domco config port. */
	port: number;

	/** The app entrypoint to import `createApp` from. */
	appId: string;
}) => Promise<string> | string;

export type Adapter = {
	/** The name of the adapter. */
	name: string;

	/**
	 * The script to run after Vite build is complete.
	 */
	run: () => any;

	/**
	 * Message to log when the build is complete.
	 */
	message: string;

	/**
	 * Entry point for the server application.
	 */
	entry: AdapterEntry;
};

export type AdapterBuilder<AdapterOptions = {}> = (
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
	 * Import from `"domco/adapter/..."`
	 *
	 * Defaults to `undefined` - creates a NodeJS build only.
	 *
	 * @default undefined
	 */
	adapter?: ReturnType<AdapterBuilder>;

	/**
	 * port numbers.
	 */
	port?: {
		/** @default 5173 */
		dev?: number;

		/** @default 5173 */
		prod?: number;
	};
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

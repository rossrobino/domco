import { dirNames, headers } from "../../constants/index.js";
import { addRoutes, applySetup, setServer } from "../util/index.js";
import { manifest } from "domco:manifest";
import { routes } from "domco:routes";
import { Hono, type MiddlewareHandler } from "hono";
import type { HonoOptions } from "hono/hono-base";
import type { ServeStaticOptions } from "hono/serve-static";

/**
 * Creates your production Hono app instance. You can import `createApp` from
 * `dist/server/app.js` after your build is complete.
 *
 * This export must be used within a Vite build context. It will not work to
 * directly import from `"domco/app"`, instead import from your build.
 *
 * Below is an example of how to import your app after build is complete to make a
 * Node server. You can adapt this to different [environments of your choice](https://hono.dev/docs/getting-started/basic).
 *
 * The NodeJS build and adapters take care of this step for you.
 *
 * @param options createApp options
 * @returns Hono app instance.
 *
 * @example
 *
 * ```js
 * // index.js - example of the NodeJS build that is output to `dist/server/node.js`
 * import { createApp } from "./dist/server/app.js";
 * import { serve } from "@hono/node-server";
 * import { serveStatic } from "@hono/node-server/serve-static";
 *
 * const app = createApp({ serveStatic });
 *
 * serve({
 * 	fetch: app.fetch,
 * 	port: process.env.PORT || 5173
 * });
 * ```
 */
export const createApp = <Env extends {} = any>(options?: {
	honoOptions?: HonoOptions<Env>;
	serveStatic?: (options?: ServeStaticOptions) => MiddlewareHandler;
}) => {
	const { honoOptions, serveStatic } = options ?? {};

	const app = new Hono<Env>(honoOptions);

	app.use(setServer);

	applySetup(app, routes);

	// handlers need to be added after static so handleStatic will run first
	if (serveStatic) {
		app.use(`/${dirNames.out.client.immutable}/*`, async (c, next) => {
			await next();
			c.header("cache-control", headers.cacheControl.immutable);
		});

		app.use(async (c, next) => {
			if (c.req.method === "GET") {
				return serveStatic({
					root: `./${dirNames.out.base}/${dirNames.out.client.base}`,
				})(c, next);
			}
			await next();
		});
	}

	addRoutes({ app, routes, manifest });

	return app;
};

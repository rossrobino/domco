import { addRoutes, applySetup, setServer } from "./util/index.js";
import { manifest } from "domco:manifest";
import { routes } from "domco:routes";
import { Hono, type MiddlewareHandler } from "hono";
import type { HonoOptions } from "hono/hono-base";

/**
 * Creates your production Hono app instance. You can import `createApp` from
 * `./dist/server/app.js` after your build is complete.
 *
 * This export must be used within a Vite build context. It will not work to
 * directly import from `"domco/app"`, instead import from your build.
 *
 * Below is an example of how to import your app after build is complete to make a
 * Node server. You can adapt this to different [environments of your choice](https://hono.dev/docs/getting-started/basic).
 *
 * @param options createApp options
 * @returns Hono app instance.
 *
 * @example
 *
 * ```js
 * // example using Node.js and `@hono/node-server`
 * import { serve } from "@hono/node-server";
 * import { serveStatic } from "@hono/node-server/serve-static";
 * import { createApp } from "./dist/server/app.js";
 *
 * const app = createApp({ middleware: [serveStatic({ root: "./dist/client" })] });
 *
 * serve(app);
 * ```
 */
export const createApp = <Env extends {} = any>(
	options: {
		honoOptions?: HonoOptions<Env>;
		middleware?: MiddlewareHandler[];
	} = {},
) => {
	const app = new Hono<Env>(options.honoOptions);

	app.use(setServer);

	applySetup(app, routes);

	if (options.middleware) {
		for (const mw of options.middleware) {
			app.use(mw);
		}
	}

	addRoutes({ app, routes, manifest });

	return app;
};

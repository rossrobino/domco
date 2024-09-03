import type { Routes } from "../../types/private/index.js";
import { createRoutes } from "../../util/create-routes/index.js";
import { addRoutes, applySetup, setServer } from "../util/index.js";
import { Hono } from "hono";
import type { HonoOptions } from "hono/hono-base";
import { html } from "hono/html";
import fs from "node:fs/promises";
import path from "node:path";
import type { ViteDevServer } from "vite";
import process from "node:process";

/**
 * Creates a app for development use in the `configureServer` Vite hook.
 *
 * @param options
 * @returns Hono app instance.
 */
export const createAppDev = <Env extends {} = any>(options?: {
	devServer?: ViteDevServer;
	honoOptions?: HonoOptions<Env>;
}) => {
	const { devServer, honoOptions } = options ?? {};

	const rootApp = new Hono<Env>(honoOptions);

	rootApp.all("/*", async (c) => {
		// this has to be called each request for HMR
		const routes = await getRoutesDev({
			devServer,
		});

		// start fresh each time for dev for HMR
		const app = new Hono(honoOptions);

		app.onError((err, c) => {
			console.log();
			console.error(err);
			return c.html(errorTemplate(err));
		});

		app.notFound((c) => {
			return c.html(
				errorTemplate({
					message: "404 - Not Found",
					stack: `No route matched for ${c.req.url}\n\nMake sure there is a route registered for this path.`,
					name: "404 - Not Found",
				}),
			);
		});

		app.use(setServer);

		applySetup(app, routes);

		addRoutes({ app, routes });

		app.use(async (c, next) => {
			// fallback to the html in dev, vite does not automatically serve the fallback
			// can't use serve static here on `src` because it will not apply the transformations
			const html = routes[c.req.path]?.page;
			if (html) return c.html(html);

			await next();
		});

		return app.fetch(c.req.raw);
	});

	return rootApp;
};

/**
 * Gets the routes in development using the pre-built file names and the Vite
 * module runner.
 *
 * @returns Loaded route modules, keys are `routePath`s.
 */
const getRoutesDev = async (options: { devServer?: ViteDevServer }) => {
	const { devServer } = options;

	const merged = await createRoutes();

	const loadedRoutes: Routes = {};

	for (const routePath in merged) {
		// convert filepaths into modules and html strings
		loadedRoutes[routePath] = {};

		loadedRoutes[routePath].client = merged[routePath]?.client;

		if (merged[routePath]?.server) {
			const handlerPath = path.join(process.cwd(), merged[routePath].server);

			loadedRoutes[routePath].server =
				await devServer?.ssrLoadModule(handlerPath);
		}

		if (merged[routePath]?.page) {
			const html = await fs.readFile(
				path.join(process.cwd(), merged[routePath].page),
				"utf-8",
			);
			loadedRoutes[routePath].page = await devServer?.transformIndexHtml(
				routePath,
				html,
			);
		}
	}

	return loadedRoutes;
};

const errorTemplate = (err: Error) => html`
	<!doctype html>
	<html>
		<head>
			<script type="module" src="@vite/client"></script>
			<title>${err.name}</title>
			<style>
				body {
					font-family: system-ui, sans-serif;
					margin-inline: auto;
					max-width: 768px;
					padding-inline: 1rem;
				}
				pre {
					color: white;
					background-color: black;
					border-radius: 0.25rem;
					padding: 1rem;
					overflow-x: scroll;
					line-height: 1.5;
				}
			</style>
		</head>
		<body>
			<h1>${err.name}</h1>
			<pre><code>${err.stack}</code></pre>
		</body>
	</html>
`;

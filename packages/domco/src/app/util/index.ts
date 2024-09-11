import { setup } from "../../constants/index.js";
import { type TagDescriptor, serializeTags } from "../../injector/index.js";
import type { Routes } from "../../types/private/index.js";
import type {
	Client,
	CreateAppOptions,
	DomcoContextVariableMap,
	Page,
	Server,
} from "../../types/public/index.js";
import type { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { raw } from "hono/html";
import type { Manifest } from "vite";

export const addMiddleware = (
	app: Hono<any>,
	middleware: CreateAppOptions["middleware"],
) => {
	if (middleware) {
		for (const mw of middleware) {
			app.use(mw.path, mw.handler);
		}
	}
};

/**
 * Adds routes based on route modules to the base app.
 *
 * @param options
 */
export const addRoutes = (options: {
	/** app to add routes to. */
	app: Hono<any>;

	/** `Routes` to add. */
	routes: Routes;

	manifest?: Manifest;
}) => {
	const { app, routes, manifest } = options;

	const routeApps: { routeId: string; routeApp: Hono }[] = [];

	for (const routeId in routes) {
		const route = routes[routeId]!;

		if (route.server?.default) {
			routeApps.push({ routeId, routeApp: route.server.default });
		}
	}

	routeApps.sort((a, b) => b.routeId.localeCompare(a.routeId));

	// avoids setting multiple times since the same route can be declared twice
	const varsSet = new Set<string>();

	for (const { routeId, routeApp } of routeApps) {
		if (routeId !== setup) {
			// set middleware by route

			for (const route of routeApp.routes) {
				let routePath = `${routeId === "/" ? "" : routeId}${route.path === "/" ? "" : route.path}`;
				if (routePath === "") routePath = "/";

				if (!varsSet.has(routePath)) {
					varsSet.add(routePath);

					const page: Page = (routePath) => {
						if (!routePath) routePath = routeId;

						return routes[routePath]?.page ?? "";
					};

					const client: Client = (routePath) => {
						if (!routePath) routePath = routeId;

						const entryPath = routes[routePath]?.client;

						if (!entryPath)
							throw Error(`No client script found for ${routePath}`);

						const tags: TagDescriptor[] = [];

						if (manifest) {
							tags.push(...getTagsForEntry({ manifest, entryPath }));
						} else {
							tags.push({
								tag: "script",
								attrs: { type: "module", src: routes[routePath]?.client ?? "" },
							});
						}

						const result = serializeTags(tags);

						return raw(result);
					};

					app.use(routePath, setVariables({ page, client }));
				}
			}

			app.route(routeId, routeApp);
		}
	}
};

const getTagsForEntry = (options: {
	manifest: Manifest;
	entryPath: string;
	cssOnly?: boolean;
}) => {
	const { manifest, entryPath, cssOnly } = options;

	const chunk = manifest[entryPath];

	if (!chunk) return [];

	const tags: TagDescriptor[] = [];

	if (!cssOnly) {
		// push the entry file name
		// not needed for `imports`, they are already linked in the code
		tags.push({
			tag: "script",
			attrs: { type: "module", src: `/${chunk.file}` },
		});
	}

	if (chunk.css) {
		// need to also do this for `imports` since css does not actually link in the code
		for (const cssFile of chunk.css) {
			tags.push({
				tag: "link",
				attrs: { rel: "stylesheet", href: `/${cssFile}` },
			});
		}
	}

	if (chunk.imports) {
		// recursively call on imports
		for (const imp of chunk.imports) {
			tags.push(
				...getTagsForEntry({ manifest, entryPath: imp, cssOnly: true }),
			);
		}
	}

	return tags;
};

export const setVariables = (variables: Partial<DomcoContextVariableMap>) =>
	createMiddleware(async (c, next) => {
		for (const [variable, value] of Object.entries(variables)) {
			c.set(variable, value);
		}
		await next();
	});

export const addSetup = (app: Hono<any>, routes: Routes) => {
	if (routes[setup]?.server?.default) {
		app.route("/", routes[setup].server.default);
	}
};

export const setServer = createMiddleware((appC, next) => {
	const server: Server = (routePath: string, init?: RequestInit) => {
		const req = new Request(new URL(appC.req.url).origin + routePath, init);
		return fetch(req);
	};

	return setVariables({ server })(appC, next);
});

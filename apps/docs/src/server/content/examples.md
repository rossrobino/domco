# Examples

<on-this-page></on-this-page>

Here are a few basic examples of common integrations and workflows. Check out the [domco-examples](https://github.com/rossrobino/domco-examples) repository for the complete suite of examples including SSR framework integrations.

## Multi-Page Application

Given the following directory structure, you can create a multi-page application.

```txt
src/
├── client/
│	├── bar
│   │   └── +page.html
│   └── foo
│       └── +page.html
└── server/
	└── +func.ts
```

Import the pages and send them in a `Response` based on the `pathname`.

```ts
// src/server/+func.ts
// transformed src/client/bar/+page.html
import { html as bar } from "client:page/bar";
// transformed src/client/foo/+page.html
import { html as foo } from "client:page/foo";
import type { Handler, Prerender } from "domco";

export const handler: Handler = (req) => {
	const { pathname } = new URL(req.url); // get the pathname from the request

	// serve the html based on the pathname
	if (pathname === "/bar") {
		return new Response(bar, { headers: { "Content-Type": "text/html" } });
	} else if (pathname === "/foo") {
		return new Response(foo, { headers: { "Content-Type": "text/html" } });
	}

	return new Response("Not found", { status: 404 });
};

// if you want to prerender the routes to static pages during build
export const prerender: Prerender = ["/bar", "/foo"];
```

## Server Frameworks

### Hono

[Hono](https://hono.dev/) is a fast, lightweight server framework built on Web Standards with support for any JavaScript runtime.

```ts
// src/server/+func.ts
import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export const handler = app.fetch;
```

### h3

[h3](https://h3.unjs.io/) is a server framework built for high performance and portability running in any JavaScript runtime.

```ts
// src/server/+func.ts
import { html } from "client:page";
import { createApp, eventHandler, toWebHandler } from "h3";

const app = createApp();

app.use(eventHandler(() => html));

export const handler = toWebHandler(app);
```

### Elysia

[Elysia](https://elysiajs.com) is an ergonomic server framework for humans. It has end-to-end type safety, type integrity, and exceptional developer experience. Supercharged by [Bun](https://bun.sh/).

```ts
// src/server/+func.ts
import { html } from "client:page";
import { Elysia } from "elysia";

const app = new Elysia().get("/", () => {
	return new Response(html, {
		headers: { "Content-Type": "text/html" },
	});
});

export const handler = app.handle;
```

```json {4}
// package.json
{
	"scripts": {
		"dev": "bunx --bun vite"
	}
}
```

## Routers

If you just want to add a router, and create your own context for each route, here's an example.

### Trouter

[Trouter](https://github.com/lukeed/trouter) is a fast, small-but-mighty, familiar ~~fish~~ router.

```ts
// src/server/+func.ts
import { html } from "client:page";
import type { Handler } from "domco";
import { Trouter, type Methods } from "trouter";

// custom context variable
type Context = {
	req: Request;
	params: Record<string, string>;
};

// custom handler/middleware
type RouteHandler = (context: Context) => Promise<Response | void>;

const router = new Trouter<RouteHandler>();

router
	.get("/", async (_c) => {
		return new Response(html, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	})
	.get("/api/:id", async ({ params }) => {
		return new Response(JSON.stringify({ id: params.id }), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	});

export const handler: Handler = async (req) => {
	const { pathname } = new URL(req.url);

	const { handlers, params } = router.find(req.method as Methods, pathname);

	for (const h of handlers) {
		// create context
		const context: Context = { req, params };

		// pass into handler
		const res = await h(context);

		if (res instanceof Response) {
			return res;
		}
	}

	return new Response("Not found", { status: 404 });
};
```

## Deployment

### Node server

Here's an example of how to serve your func using the result of your build using `node:http`, [`sirv`](https://github.com/lukeed/sirv/tree/master/packages/sirv), and [`domco/listener`](https://github.com/rossrobino/domco/blob/main/packages/domco/src/listener/index.ts).

```ts
// server.js
// import the `handler` from the build output
import { handler } from "./dist/server/func.js";
// converts web handler to a Node compatible request listener
import { nodeListener } from "domco/listener";
import { createServer } from "node:http";
// `sirv` serves static assets
import sirv from "sirv";

const assets = sirv("dist/client", {
	etag: true,
	setHeaders: (res, pathname) => {
		// serve `dist/client/_immutable/*` with immutable headers
		if (pathname.startsWith("/_immutable/")) {
			res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
		}
	},
});

const server = createServer((req, res) =>
	// first, look for a static asset
	assets(req, res, () =>
		// fallthrough to the handler if static asset is not found
		nodeListener(handler)(req, res),
	),
);

server.listen(3000);
```

Run this module to start your server and navigate to http://localhost:3000/ to view your application.

```bash
node server.js
```

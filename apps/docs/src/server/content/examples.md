# Examples

## Server Frameworks

Here are some examples of how to use a few popular server-side frameworks with domco.

### Hono

[Hono](https://hono.dev/) is a fast, lightweight server framework built on Web Standards with support for any JavaScript runtime.

```ts
// src/server/+app.ts
import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export const handler = app.fetch;
```

### h3

[h3](https://h3.unjs.io/) is a server framework built for high performance and portability running in any JavaScript runtime.

```ts
// src/server/+app.ts
import { html } from "client:page";
import { createApp, eventHandler, toWebHandler } from "h3";

const app = createApp();

app.use(eventHandler(() => html));

export const handler = toWebHandler(app);
```

## Routers

If you just want to add a router, and create your own context for each route, here's an example.

### Trouter

[Trouter](https://github.com/lukeed/trouter) is a fast, small-but-mighty, familiar ~~fish~~ router.

```ts
import { html } from "client:page";
import type { Handler } from "domco";
import { Trouter, type Methods } from "trouter";

// Custom context variable.
type Context = {
	req: Request;
	params: Record<string, string>;
};

// Custom handler/middleware.
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
		// Create context.
		const context: Context = { req, params };

		// Pass into handler.
		const res = await h(context);

		if (res instanceof Response) {
			return res;
		}
	}

	return new Response("Not found", { status: 404 });
};
```

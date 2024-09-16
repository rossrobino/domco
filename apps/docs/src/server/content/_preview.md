```ts {1,5}
import { html } from "client:page";

export const handler = async (req: Request) => {
	return new Response(
		html, // Your Vite app.
		{
			headers: { "Content-Type": "text/html" },
		},
	);
};
```

## Create Full-Stack Applications with Vite

domco turns your [Vite](https://vitejs.dev) project into a full-stack application. You can take advantage of Vite's build pipeline, plugins, and HMR in a full-stack context using Hono as your web server.

This project is inspired by other projects including [HonoX](https://github.com/honojs/honox), [Vinxi](https://vinxi.vercel.app/), and [SvelteKit](https://kit.svelte.dev).

## Build with Web APIs

Server-side JavaScript runtimes are standardizing on the Web [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) APIs. This makes it possible to write your app once and deploy it to a variety of different platforms using [adapters](/deploy#adapters).

## No Dependencies

domco is minimal in size, it has no dependencies other than Vite. This keeps install times short, and reduces the risk of a supply chain attack.

## Add a Framework, or don't

One of the main goals of this project is to be able to create full-stack JavaScript applications using vanilla JavaScript. Without domco, it is challenge to achieve the same developer experience as other server-side frameworks that are based around a UI library. By default, domco only bundles only the code you write.

If you do need to add a framework, on the front-end you can use any Vite plugin as you would in a traditional Vite application.

On the server, domco is compatible with any server-side JavaScript framework that can provide a web request handler that takes a `Request` as an argument and returns a `Response`. Here are some examples of how to use a few popular server-side frameworks with domco.

### Hono

[Hono](https://hono.dev/) is a fast, lightweight server framework built on Web Standards with support for any JavaScript runtime.

```ts
// src/server/+app.ts
import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.use((c) => c.html(html));

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

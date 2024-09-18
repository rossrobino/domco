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

domco turns your [Vite](https://vitejs.dev) project into a full-stack application. You can leverage Vite's build pipeline, plugins, and HMR within a full-stack context using Hono as your web server.

This project draws inspiration from [HonoX](https://github.com/honojs/honox), [Vinxi](https://vinxi.vercel.app/), and [SvelteKit](https://kit.svelte.dev).

### Build with Web APIs

Server-side JavaScript runtimes are standardizing on the Web [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) APIs. This makes it possible to write your app once and deploy it to a variety of different platforms using [adapters](/deploy#adapters).

### Add a Framework, or don't

One of the main goals of domco is to be able to create full-stack JavaScript applications using vanilla JavaScript. Without domco, it's challenging to achieve the same developer experience as other frameworks that are based around a UI library. By default, domco only bundles only the code you write, making it efficient and straightforward.

If you need a front-end framework, you can use any Vite plugin as you would in a traditional Vite application.

On the server, domco is compatible with any server-side JavaScript framework that provides a web request handler taking a `Request` argument and returning a `Response`. Check out the [examples](/examples) to see how to use popular server frameworks with domco.

### Minimal Dependencies

domco is lightweight, relying solely on Vite as its dependency. This results in quick installation times, fast build and development processes, and a reduced risk of supply chain attacks.

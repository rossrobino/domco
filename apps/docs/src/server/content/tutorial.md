# Tutorial

<on-this-page></on-this-page>

> The following documentation covers the basics of creating a site and all of the features domco provides in addition to Vite. See the [Vite documentation](https://vitejs.dev/) for more information and configuration options.

## Create a new project

To get started, you'll need to have [Node](https://nodejs.org), [Bun](https://bun.sh/), or [Deno](https://deno.com) or installed on your computer. Then run the `create` script below to create a new project. If you already have an existing client-side Vite project you would like to add a server to, check out the [migration instructions](/migrate).

```bash
npm create domco@latest
```

## Entry points

domco identifies the entry points of your application by file name. These entry points are prefixed with `+` so they are easily identifiable.

### +app

The application entry point is located in within `src/server/`, this is the server entry point for your application.

```txt {3}
src/
└── server/
	└── +app.(js,ts,jsx,tsx)
```

The `+app` module exports a `default` object with a `fetch` function that takes in a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request), and returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response).

```ts
// src/server/+app
export default {
	fetch(req: Request) {
		return new Response("Hello world");
	},
};
```

From here, you could route different requests to different responses, based on the [`req.url`](https://developer.mozilla.org/en-US/docs/Web/API/Request/url).

```ts
// src/server/+app
export default {
	fetch(req: Request) {
		const url = new URL(req.url);

		if (url.pathname === "/") {
			return new Response("Hello");
		} else if (url.pathname === "/world") {
			return new Response("World");
		}

		return new Response("Not found", { status: 404 });
	},
};
```

Alternatively, you can use a Fetch API compatible router like [Hono](https://hono.dev). Most routers provide a `fetch` or `handler` method to handle requests in production, which you can pass into the `default` export.

```ts {7,10}
// src/server/+app
import { Hono } from "hono";

const app = new Hono();

// pass to the default export
export default { fetch: app.fetch };

// or if the method is named `fetch`, export directly
export default app;
```

### +page

To create a page, add `+page.html` file in a directory within `src/client/`.

domco [configures Vite](https://vitejs.dev/guide/build#multi-page-app) to process each `+page.html` as a separate entry point automatically. Everything linked in these pages will be bundled and included in the output upon running `vite build`. You can serve the transformed contents of a page via the [`client:page`](#client%3Apage) virtual module.

```txt {3}
src/
├── client/
│	└── +page.html
└── server/
	└── +app.ts
```

### +script

Each `+script.(js,ts,jsx,tsx)` file within `src/client/` will be [processed as an entry point](https://rollupjs.org/configuration-options/#input) by Vite. Client-side scripts can be used in pages via a `script` tag, or on the server _without_ a page by using the [`client:script`](#client%3Ascript) virtual module.

```txt {3}
src/
├── client/
│	└── +script.ts
└── server/
	└── +app.ts
```

## Virtual modules

One challenging aspect of full-stack development and server-side rendering is managing the client files correctly during development and production. In development, you need to link directly to source files to benefit from features like TypeScript support and Hot Module Replacement (HMR). In production, the build process transforms each file and applies a hash to the filename for caching purposes.

domco takes care of these problems using [virtual modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention). You can easily serve a `+page` or include the tags for a `+script` in a response. domco ensures the correct assets are linked during development and in production.

### client:page

You can import the transformed HTML of any `+page.html` from this module or one of it's sub-paths. domco calls Vite's [`transformIndexHtml`](https://vitejs.dev/guide/api-plugin.html#transformindexhtml) hook on the imported page and inlines it into your server bundle.

```ts {3,10}
// src/server/+app
// returns transformed content of `src/client/+page.html`
import { html } from "client:page";
// `src/client/other/+page.html`
import { html as otherHtml } from "client:page/other";

export default {
	fetch(req: Request) {
		return new Response(
			html, // bundled client application
			{ headers: { "content-type": "text/html" } },
		);
	},
};
```

You can also import the `chunk` information for the linked JS entry point to a page. This holds the same data [`client:script`](#client%3Ascript) provides.

```ts
import { chunk } from "client:page";

chunk.src.assets; // ex: assets might contain a font path you want to preload
```

### client:script

Easily get the `<script>` and related `<link>` tags for any `+script` module on the server by accessing the `client:script` virtual module. They can be included in an HTML string, or inside of JSX.

In development, domco links the scripts to the source. In production, domco [reads](https://vitejs.dev/guide/backend-integration.html) the [manifest](https://vitejs.dev/config/build-options.html#build-manifest) generated by the client build and includes the hashed version of these file names and their imports.

```ts {4,19}
// src/server/+app
import {
	// arrays of the hashed related paths for the entry point.
	src,
	// string of <script> and <link> tags for related resources
	tags,
} from "client:script";
// `src/client/other/+script.ts`
import { tags as otherTags } from "client:script/other";

export default {
	fetch(req: Request) {
		return new Response(
			`<!doctype html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					${tags}
					<title>Document</title>
				</head>
				...
			</html>`,
			{ headers: { "content-type": "text/html" } },
		);
	},
};
```

## Prerender

Add a `prerender` property to the `default` export to prerender routes. `prerender` can be an `Array` or a `Set` of paths to prerender, or a function that returns the paths.

```ts {6}
// src/server/+app
export default {
	fetch(req) {
		//...
	},
	prerender: ["/", "/post-1", "/post-2", "/some.css", "/some.json"],
};
```

After the Vite build is complete, domco will import `default.fetch` from your application and make a request to each `default.prerender` path provided. The responses will be written to `dist/client/(path)` files upon build. If the path does not have an extension, `/index.html` will be added to the end of the file path.

For the export above, domco would request each path and generate the following files from the responses.

| Prerender Path | File Created                    |
| -------------- | ------------------------------- |
| `/`            | `dist/client/index.html`        |
| `/post-1`      | `dist/client/post-1/index.html` |
| `/post-2`      | `dist/client/post-2/index.html` |
| `/some.css`    | `dist/client/some.css`          |
| `/some.json`   | `dist/client/some.json`         |

If you are using an [adapter](/deploy#adapters), these static files will be served in front of your `fetch` handler. So when an `index.html` file is found for the route, it is served directly without hitting your fetch handler.

## That's it!

domco has a minimal API surface area and tries to get out of your way during development. For more examples (framework, library) check out the [domco-examples](https://github.com/rossrobino/domco-examples) repository.

Next, learn how to [deploy](/deploy) your application.

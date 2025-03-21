# Tutorial

<on-this-page></on-this-page>

The following documentation covers the basics of creating a site and all of the features domco provides in addition to Vite. See the [Vite documentation](https://vitejs.dev/) for more information and configuration options.

<drab-youtube aria-label="YouTube Tutorial" uid="jWnzCZru6cU">
    <iframe data-content></iframe>
</drab-youtube>

## Create a new project

To get started, you'll need to have [Node](https://nodejs.org) (recommended), [Bun](https://bun.sh/), or [Deno](https://deno.com) or installed on your computer. Then run the [`create-domco`](https://github.com/rossrobino/domco/tree/main/packages/create-domco) script to create a new project. If you already have an existing client-side Vite project check out the [migration instructions](/migrate).

### Node

```bash
npm create domco@__CREATE_VERSION__
```

### Bun

```bash
bun create domco@__CREATE_VERSION__
```

### Deno

```bash
deno run -A npm:create-domco@__CREATE_VERSION__
```

## Entry Points

domco identifies the entry points of your application by file name. These entry points are prefixed with `+` so they are easily identifiable.

### +func

The function entry point is located in within `src/server/`, this is the server entry point for your application.

```txt {3}
src/
└── server/
	└── +func.(js,ts,jsx,tsx)
```

`+func` modules export a `handler` function that takes in a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request), and returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response).

```ts
// src/server/+func.ts
export const handler = async (req: Request) => {
	return new Response("Hello world");
};
```

From here, you could route different requests to different responses, based on the [`req.url`](https://developer.mozilla.org/en-US/docs/Web/API/Request/url).

```ts
// src/server/+func.ts
export const handler = async (req: Request) => {
	const { pathname } = new URL(req.url);

	if (pathname === "/") {
		return new Response("Hello");
	} else if (pathname === "/world") {
		return new Response("World");
	}

	return new Response("Not found", { status: 404 });
};
```

Or check out the examples and [add a router](/examples#routers).

### +page

To create a page, add `+page.html` file in a directory within `src/client/`.

domco [configures Vite](https://vitejs.dev/guide/build#multi-page-app) to process each `+page.html` as a separate entry point automatically. Everything linked in these pages will be bundled and included in the output upon running `vite build`. You can serve the transformed contents of a page via the [`client:page`](#client%3Apage) virtual module.

```txt {3}
src/
├── client/
│	└── +page.html
└── server/
	└── +func.ts
```

### +script

Each `+script.(js,ts,jsx,tsx)` file within `src/client/` will be [processed as an entry point](https://rollupjs.org/configuration-options/#input) by Vite. Client-side scripts can be used in pages via a `script` tag, or on the server _without_ a page by using the [`client:script`](#client%3Ascript) virtual module.

```txt {3}
src/
├── client/
│	└── +script.ts
└── server/
	└── +func.ts
```

## Virtual Modules

One challenging aspect of full-stack development and server-side rendering is managing the client files correctly during development and production. In development, you need to link directly to source files to benefit from features like TypeScript support and Hot Module Replacement (HMR). In production, the build process transforms each file and applies a hash to the filename for caching purposes.

domco takes care of these problems using [virtual modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention). You can easily serve a `+page` or include the tags for a `+script` in a response. domco ensures the correct assets are linked during development and in production.

### client:page

You can import the transformed HTML of any `+page.html` from this module or one of it's sub-paths. domco calls Vite's [`transformIndexHtml`](https://vitejs.dev/guide/api-plugin.html#transformindexhtml) hook on the imported page and inlines it into your server build.

```ts {3,9}
// src/server/+func.ts
// returns transformed content of `src/client/+page.html`
import { html } from "client:page";
// `src/client/other/+page.html`
import { html as otherHtml } from "client:page/other";

export const handler = async (req: Request) => {
	return new Response(
		html, // bundled client application
		{
			headers: { "content-type": "text/html" },
		},
	);
};
```

### client:script

You can also easily get the `<script>` tags for any `+script` module on the server as well. These script tags (including all imports) can be accessed via the `client:script` virtual module. They can be included in an HTML string, or inside of JSX.

In development, domco links the scripts to the source. In production, domco [reads](https://vitejs.dev/guide/backend-integration.html) the [manifest](https://vitejs.dev/config/build-options.html#build-manifest) generated by the client build and includes the hashed version of these file names and their imports.

```ts {3,14}
// src/server/+func.ts
// returns transformed content of `src/client/+script.ts`
import { tags } from "client:script";
// `src/client/other/+script.ts`
import { tags as otherTags } from "client:script/other";

export const handler = async (req: Request) => {
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
		{
			headers: { "content-type": "text/html" },
		},
	);
};
```

## Prerender

Export a `prerender` variable to prerender routes. `prerender` can be an array or set of paths to prerender, or a function that returns the paths.

```ts
// src/server/+func.ts
import type { Prerender } from "domco";

export const prerender: Prerender = [
	"/",
	"/post-1",
	"/post-2",
	"/some.css",
	"/some.json",
];
```

After the Vite build is complete, domco will import the `handler` from your function module and request the routes provided. The responses will be written to `dist/client/(prerender-path)` files upon build. If the path does not have an extension, `/index.html` will be added to the end of the file path to write.

For the export above, domco would request each path and generate the following files from the responses.

| Prerender Path | File Created                    |
| -------------- | ------------------------------- |
| `/`            | `dist/client/index.html`        |
| `/post-1`      | `dist/client/post-1/index.html` |
| `/post-2`      | `dist/client/post-2/index.html` |
| `/some.css`    | `dist/client/some.css`          |
| `/some.json`   | `dist/client/some.json`         |

If you are using an [adapter](/deploy#adapters), these static files will be served in front of your request handler. So when an `index.html` file is found for the route, it is served directly without hitting your handler.

## That's It!

domco has a minimal API surface area and tries to get out of your way during development.

Next, learn how to [deploy](/deploy) your application.

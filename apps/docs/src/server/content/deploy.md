# Deploy

<on-this-page></on-this-page>

## Build

Run [`vite build`](https://vitejs.dev/guide/cli.html#vite-build) to build your application into `dist/`. Vite will build both the client and server builds, then domco will prerender any static routes and [run the adapter](#adapters) if set.

```
dist/
├── client/
│	├── (_immutable/) - any JS/CSS/immutable assets
│	└── (index.html) - prerendered pages
└── server/
	├── app.js - server entry point
	└── (adapter-entry.js) - if using an adapter
```

## Adapters

Install and add a deployment adapter within your Vite config to output your application to a different target with no additional configuration.

```ts {3,10-13}
// vite.config
// import adapter
import { adapter } from "@domcojs/{adapter-name}";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			// add to your domco config
			adapter: adapter({
				// options...
			}),
		}),
	],
});
```

### Cloudflare

```bash
npm i -D @domcojs/cloudflare
```

The [Cloudflare](https://cloudflare.com) adapter outputs your application to run on [Cloudflare Pages](https://pages.cloudflare.com/).

- Runs on [workerd](https://github.com/cloudflare/workerd).
- Outputs public assets to be served on Cloudflare's CDN.

<img loading="lazy" src="/_vercel/image?url=/images/cloudflare/build-settings.png&w=1280&q=100" alt='A screenshot of the Cloudflare Build Settings UI. Set the Framework Preset field to "None", set the build command to "npm run build", and the build output directory to ".cloudflare".' />

### Deno

```bash
npm i -D @domcojs/deno
```

The [Deno](https://deno.com) adapter outputs your application to run on [Deno Deploy](https://deno.com/deploy). You do not have to use Deno for development to use this adapter.

- Runs on Deno.
- Static files are served with [`@std/http/file-server`](https://jsr.io/@std/http).

<img loading="lazy" src="/_vercel/image?url=/images/deno/build-settings.png&w=1280&q=100" alt='A screenshot of the Deno Deploy Project Configuration UI. Set the Framework Preset field to "None", set the build command to "deno run -A npm:vite build", and the entry point to "dist/server/main.js".' />

### Vercel

```bash
npm i -D @domcojs/vercel
```

The [Vercel](https://vercel.com) adapter outputs your application to the [Build Output API](https://vercel.com/docs/build-output-api/v3) specification.

- Runs on [Node.js](https://vercel.com/docs/functions/runtimes#node.js) or [Node.js with ISR](https://vercel.com/docs/incremental-static-regeneration).
- Outputs public assets to be served on Vercel's [Edge Network](https://vercel.com/docs/edge-network/overview).
- Supports on demand [Image Optimization](https://vercel.com/docs/image-optimization) when configured in the adapter config.
  - Set the `src` attribute of an image using the `/_vercel/image/...` [optimized URL format](https://vercel.com/docs/image-optimization#optimized-url-format). In `dev` and `preview` modes, domco will redirect to the original image.

<img loading="lazy" src="/_vercel/image?url=/images/vercel/build-settings.png&w=1280&q=100" alt='A screenshot of the Vercel Build and Development Settings UI. Set the Framework Preset field to "Other" and leave all of the other options blank.' />

## Manual deployment

If you are not using an [adapter](#adapters), you can import `default.fetch` from the `app.js` module and configure your application to use in another environment.

The `dist/client/` directory holds client assets. JS and CSS assets with hashed file names will be output to `dist/client/_immutable/`, you can serve this path with immutable cache headers. Other assets like prerendered HTML files are processed and included in `dist/client/` directly.

### Node server

Here's an example of how to serve your application using the result of your build with `node:http`, [`sirv`](https://github.com/lukeed/sirv/tree/master/packages/sirv), and [`domco/listener`](https://github.com/rossrobino/domco/blob/main/packages/domco/src/listener/index.ts).

```ts
// server.js
// import from the build output
import app from "./dist/server/app.js";
// converts web fetch handler to a Node compatible request listener
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
		// fallthrough to the fetch handler if static asset is not found
		nodeListener(app.fetch)(req, res),
	),
);

server.listen(3000);
```

Run this module to start your server and navigate to http://localhost:3000/ to view your application.

```bash
node server.js
```

## Creating an adapter

If you'd like to deploy a domco application to a different provider, and you need many configuration steps for this to take place you can create an adapter.

Check out the [current adapters](https://github.com/rossrobino/domco/tree/main/packages) to see how to make your own.

Adapters take care of these deployment steps.

1. Set [`ssr`](https://vitejs.dev/config/ssr-options.html) options if changes are needed, for example if you are deploying to a runtime that doesn't support Node APIs, set this to `"web worker"`.
2. Create an entry point for the target environment by using `default.fetch` from `dist/server/app.js`. This could be reexporting it as a different export, or applying to a Node server.
3. Within the entry point, serve the `dist/client/*` directory as static assets, and the `dist/client/_immutable/*` directory with immutable cache headers. Static assets must be hit before `default.fetch` to take advantage of prerendering. When an asset is not found, the request needs to fallthrough to `default.fetch`.

If you think others might benefit from your adapter you can [create an issue](https://github.com/rossrobino/domco/issues) or pull request to propose a new adapter. Adapters should be created for zero configuration deployments for deployment providers, not specific to JavaScript runtimes.

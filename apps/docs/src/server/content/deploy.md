# Deploy

Run `vite build` to build your application into `dist/`.

```
.
└── dist/
	├── client/
	│	├── _immutable/
	│	└── index.html
	└── server/
		├── app.js
		└── (adapter-entry.js)
```

By default domco will generate a `app.js` module and static assets for your application.

## Example

If you are not using an [adapter](#adapters), you can import `handler` from the `app.js` module and configure your app to use in another environment.

The `dist/client/` directory holds client assets. JS and CSS assets with hashed file names will be output to `dist/client/_immutable/`, you can serve this path with immutable cache headers. Other assets like HTML files are processed and included in `dist/client/` directly.

Here's an example of how to serve your app using the result of your build using `node:http`.

```ts
// server.js
// import from build output
import { handler } from "./dist/server/app.js";
// converts web to node
import { nodeListener } from "domco/listener";
import { createServer } from "node:http";

const server = createServer(nodeListener(handler));

server.listen(3000);
```

Run this module to start your server.

```bash
node server.js
```

## Adapters

Add a deployment adapter within your Vite config to output your app to a different target with no additional configuration.

```ts {4,11-13}
// vite.config
import { domco } from "domco";
// import adapter
import { adapter } from "domco/adapter/vercel";
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

The [Cloudflare](https://cloudflare.com) adapter outputs your app to run on [Cloudflare Pages](https://pages.cloudflare.com/).

- Function runs on [workerd](https://github.com/cloudflare/workerd).
- Outputs public assets to be served on Cloudflare's CDN.

![A screenshot of the Cloudflare Build Settings UI. Set the Framework Preset field to "None", set the build command to "npm run build", and the build output directory to ".cloudflare".](/_vercel/image?url=/images/cloudflare/build-settings.png&w=1280&q=100)

### Deno

The [Deno](https://deno.com) adapter outputs your app to run on [Deno Deploy](https://deno.com/deploy). You do not have to use Deno to build your app to use this adapter.

- Function runs on Deno.
- Static files are served with [`@std/http/file-server`](https://jsr.io/@std/http).

![A screenshot of the Deno Deploy Project Configuration UI. Set the Framework Preset field to "None", set the build command to "deno run -A npm:vite build", and the entry point to "dist/server/main.js".](/_vercel/image?url=/images/deno/build-settings.png&w=1280&q=100)

### Vercel

The [Vercel](https://vercel.com) adapter outputs your app to the [Build Output API](https://vercel.com/docs/build-output-api/v3) specification.

- Function runs on [Node.js](https://vercel.com/docs/functions/runtimes#node.js), [Node.js with ISR](https://vercel.com/docs/incremental-static-regeneration), or [Edge Runtime](https://vercel.com/docs/functions/runtimes/edge-runtime).
- Outputs public assets to be served on Vercel's [Edge Network](https://vercel.com/docs/edge-network/overview).
- Supports on demand [Image Optimization](https://vercel.com/docs/image-optimization) when configured in the adapter config. Set the `src` attribute of an image using the `/_vercel/image/...` [optimized URL format](https://vercel.com/docs/image-optimization#optimized-url-format). In `dev` and `preview` modes, domco will redirect to the original image.

![A screenshot of the Vercel Build and Development Settings UI. Set the Framework Preset field to "Other" and leave all of the other options blank.](/_vercel/image?url=/images/vercel/build-settings.png&w=1280&q=100)
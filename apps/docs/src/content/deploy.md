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

By default **domco** will generate a `app.js` module and static assets for your application. If you are not using an [adapter](#adapters), you can import `createApp` from the `app.js` module and configure your app to use in one of [Hono's supported environments](https://hono.dev/docs/getting-started/basic).

The `client/` directory holds client assets. JS and CSS assets with hashed file names will automatically be served with immutable cache headers from `dist/client/_immutable/`. Other assets are processed and included in `dist/client/` directly.

## Example

Here's an example of how to serve your app using the result of your build with `@hono/node-server`.

```ts
// main.js
// import from build output
import { createApp } from "./dist/server/app.js";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = createApp({ serveStatic });

serve(app);
```

Run this module to start your server.

```bash
node main.js
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

### Vercel

The [Vercel](https://vercel.com) adapter outputs your app to the [Build Output API](https://vercel.com/docs/build-output-api/v3) specification.

![A screenshot of the Vercel Build and Development Settings UI. Set the Framework Preset field to "Other" and leave all of the other options blank.](/vercel/build-settings.webp)

- Supports Serverless (+ ISR), and Edge Runtime.
- Outputs public assets to be served on Vercel's CDN. Since your application will not be serving these assets, if you want to protect a page, you need to serve it from an endpoint instead.

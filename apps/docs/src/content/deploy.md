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
		├── (main.js)
		└── node.js
```

By default **domco** will generate a NodeJS server and static assets for your application. You can also use an [adapter](#adapters) or export your app to configure it to use in [another environment](https://hono.dev/docs/getting-started/basic).

The `client/` directory holds client assets. JS and CSS assets with hashed file names will automatically be served with immutable cache headers from `dist/client/_immutable`. Other assets are processed and included in `dist/client` directly.

The `server/` directory has three entry points:

- `app.js` exports your Hono server. You can import it in another file and deploy your app to a variety of [platforms](https://hono.dev/docs/getting-started/basic) manually. No NodeJS specific APIs are used in the `app.js` export.
- `main.js` is the main entry point for your application if you used an adapter, configured to the target environment.
- `node.js` is a NodeJS build of your application. You can run `dist/server/node.js` to run your application or preview it if you are using an adapter.

## Adapters

If you need to deploy to a different environment than static/NodeJs, you can add a deployment adapter within your Vite config to output your app to a different target with no additional configuration.

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

The Vercel adapter outputs your app to Vercel's [Build Output API](https://vercel.com/docs/build-output-api/v3) specification.

- Supports Serverless (+ ISR), and Edge Runtime.
- Outputs public assets to be served on Vercel's CDN. Since your application will not be serving these assets, if you want to protect a page, you need to serve it from an endpoint instead.

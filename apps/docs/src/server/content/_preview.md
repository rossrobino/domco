```js {1,6}
import { html } from "client:page";

export default {
	fetch(req) {
		return new Response(
			html, // bundled client application
			{ headers: { "content-type": "text/html" } },
		);
	},
};
```

domco seamlessly integrates a server into your [Vite](https://vitejs.dev) application, allowing you to easily add an API or enable server-side rendering. domco supports the standard default [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) export API, just like [Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/fetch/#syntax), [Bun](https://bun.sh/docs/api/http#export-default-syntax), and [Deno](https://docs.deno.com/runtime/fundamentals/http_server/#default-fetch-export). With domco, you can develop and deploy using Node.js, providing the flexibility to stay within a familiar environment, while also supporting other runtimes. Additionally, you gain access to Vite’s build pipeline, plugin ecosystem, and live reloading out of the box.

## Feature overview

- Automatic [entry point configuration](/tutorial#entry-points) for client and server builds.
- Development and preview server configuration.
- Easy [access to client resources](/tutorial#virtual-modules) on the server.
- Build time [prerendering](/tutorial#prerender) of static routes.
- Standardized authoring experience across runtimes and deployment providers with [adapters](/deploy#adapters).

## Add a framework, or don't

With domco, it's easy to achieve the same developer experience as other frameworks that are based around a UI library, without having to pull in additional dependencies. By default, domco only bundles only the code you write, making it efficient and straightforward.

If you need a UI framework, you can still use any [Vite plugin](https://vitejs.dev/plugins/) as you would in a traditional Vite application. These plugins will also work on the server.

## Only what you need

domco is [lightweight](https://npmgraph.js.org/?q=domco), relying solely on Vite as its dependency. This results in quick installation times, fast build and development processes, and a reduced risk of supply chain attacks.

domco is open source under the [MIT License](https://github.com/rossrobino/domco/blob/main/LICENSE.md). Contributions are welcome, see the [contributing guide](https://github.com/rossrobino/domco/blob/main/CONTRIBUTING.md) for instructions.

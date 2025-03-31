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

domco allows you to easily a server to your [Vite](https://vitejs.dev) application. You can take advantage of Vite's build pipeline, plugins, and HMR on the server using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

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

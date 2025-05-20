# domco

## 4.1.2

### Patch Changes

- ba741ed: fix: catch prerendering import error so build does not fail

## 4.1.1

### Patch Changes

- bf78350: export extra file util fns

## 4.1.0

### Minor Changes

- b1ec7f2: feat: export `src` paths from `client:script` module

  If you don't need the entire HTML tag string and would like to just get the paths for a client js entry point, you can now import the `src` and get correct asset paths in development and production.

  ```ts
  import { src } from "client:script";

  // The following contain the `src` paths for each of the resources
  // required for the entry script.
  src.modules;
  src.preload;
  src.styles;
  ```

## 4.0.0

### Major Changes

- 9c86ff0: Drop support for vite 5.
- 9c86ff0: Update server exports.

  SSR entry filename - `+func` has been renamed to `+app`.

  Instead of exporting a `handler`, you must now export a `default` object with a `fetch` method. This aligns domco with Bun, Deno, and Cloudflare's APIs.

  ```ts
  // src/server/+app
  import type { App } from "domco";

  export default {
  	fetch(req) {
  		return new Response("Hello world");
  	},
  } satisfies App;
  ```

  The `prerender` export has also moved within the `default` export.

  ```ts
  // src/server/+app
  export default {
  	fetch(req) {
  		return new Response("Hello world");
  	},
  	prerender: ["/", "/paths..."],
  };
  ```

## 3.0.2

### Patch Changes

- 4f30877: fix: TypeError for undefined entries occuring on first dev run

## 3.0.1

### Patch Changes

- f75a50e: update `nodeListener`

## 3.0.0

### Major Changes

- 51ccc90: Creates separate adapter packages for each adapter. These changes reduces the size of the core package and ensures users only install what is needed.

  If you are using an adapter, install the corresponding package `@domcojs/...`. For example, to install the Vercel adapter and update the import statements in your `vite.config` file:

  ```bash
  npm i -D @domcojs/vercel
  ```

  ```diff
  - import { adapter } from "domco/adapter/vercel";
  + import { adapter } from "@domcojs/vercel";
  ```

- 1611dc5: Moves `Injector` to a separate package - `@robino/html`

  This change reduces the size of the core package, not all users need this helper.

  If you are using the `Injector` class, install the `@robino/html` package and update your import statements accordingly.

  ```bash
  npm i @robino/html
  ```

  ```diff
  - import { Injector } from "domco/injector";
  + import { Injector } from "@robino/html";
  ```

## 2.3.0

### Minor Changes

- 8428e9a: feat: [Injector] adds `main` method to inject into the `main` element. A single `TagDescriptor` can now be provided instead of an array into injection methods.

## 2.2.2

### Patch Changes

- f545aa5: fix: sets `envDir` to cwd by default

## 2.2.1

### Patch Changes

- ef5ff15: Vite 6 maintenance

  - Fixes auto-reload for SSR only HTML responses - see [issue](https://github.com/vitejs/vite/issues/19114)
  - `create-domco` template defaults to use v6.
  - Updates project dependencies

## 2.2.0

### Minor Changes

- 5088e8d: HTML `Injector`

  Easily manipulate HTML on the server with the `Injector` helper.

  - Stabilizes the HTML `Injector` helper
  - Adds `Injector` tests

  ```ts
  import { Injector } from "domco/injector";

  const injector = new Injector(
  	`<!doctype html><html><body><!-- comment --></body></html>`,
  );

  injector
  	// Set or change the title
  	.title("My Title")
  	// pass a TagDescriptor
  	.head([{ name: "script", attrs: { type: "module", src: "./script.js" } }])
  	// pass a string of text
  	.body("Prepended to the body! ", "prepend")
  	// replace comments
  	.comment("comment", "My comment")
  	// stringify HTML
  	.toString();
  ```

  Produces the following HTML.

  ```html
  <!doctype html>
  <html>
  	<head>
  		<title>My Title</title>
  		<script type="module" src="./script.js"></script>
  	</head>
  	<body>
  		Prepended to the body! My comment
  	</body>
  </html>
  ```

## 2.1.5

### Patch Changes

- 9605fe3: `prerender` export can now be a function that returns an array or set of paths to prerender like in react-router v7. This makes it easier to prerender programmatically without having to create another function.

  ```ts
  // src/server/+func.ts
  import type { Prerender } from "domco";

  // prerender can still be a value, for example:
  export const prerender: Prerender = ["/prerender"];
  export const prerender: Prerender = new Set(["/prerender"]);

  // now prerender can also be a function, for example:
  export const prerender: Prerender = () => ["/prerender"];
  export const prerender: Prerender = async () => new Set(["/prerender"]);
  ```

## 2.1.4

### Patch Changes

- 8c59699: `prerender` export can now be a `Set` in addition to being an `Array`

## 2.1.3

### Patch Changes

- f106fac: Use `name` in the output filename instead of as a directory for easier debugging in production dev tools. Now the name will show up in the network tab instead of just the hash.

  Example:

  `dist/client/_immutable/name/hash.js` is now `dist/client/_immutable/name.hash.js`

## 2.1.2

### Patch Changes

- d84a2c8: Inject vite client into all html responses for better dev experience. Now will refresh even when there is only html returned from a response.

## 2.1.1

### Patch Changes

- e783a67: clean up empty directories after prerendering

## 2.1.0

### Minor Changes

- 3ac7c4b: Adds support for prerendering any file instead of just `html`. See [docs](https://domco.robino.dev/tutorial#prerender)

## 2.0.1

### Patch Changes

- 8f9be00: Include Vite 6 as peer dependency to support when released - tested with beta
- 135fda4: Improves build logs

## 2.0.0

### Major Changes

- 371d3f7: Renames `+app` to `+func`

  If you are using a UI framework with domco it's nice to have an `app` directory that can be imported on the server and client that holds the components of your application. Having the server entry point named `+app` made the function of the module less clear. This change renames the `+app` entry point to `+func`. There are no other breaking changes.

## 1.0.0

### Major Changes

- 344d88a: v1.0.0

  ## Stable API

  Settled on an API and scope for the project.

  domco follows semantic versioning, so there will no longer be breaking changes between minor versions now that the project is v1.

  ## Breaking changes

  None from v0.13, if upgrading from a lower version [see the changelog](https://github.com/rossrobino/domco/blob/main/packages/domco/CHANGELOG.md) or consult the [documentation](https://domco.robino.dev) for details.

## 0.13.3

### Patch Changes

- f498a79: fix: tags import chunks not found error

  - Preloads modules that are imported into entry points in case of manual chunks are used.

## 0.13.2

### Patch Changes

- 74f1827: fix: windows entry point paths

## 0.13.1

### Patch Changes

- f915105: fix: reference on `DomcoConfig` and export `MaybePromise`

## 0.13.0

### Minor Changes

- d50685c: Server framework agnostic

  This project had a lot of overlap with HonoX, HonoX should be the default if you are wanting all of the features Hono provides like client components. This update removes the dependency on Hono and making the library framework agnostic. Hono can still be easily used with domco (see below).

  This makes domco have no dependencies other than Vite. You can now build your app with vanilla JS without any external libraries. You can now use any server framework like Hono that provides a function that handles a web `Request` and returns a `Response`. This update also simplifies domco's API and refactors much of the codebase to make it smaller and builds faster.

  ## Overview of Changes

  - `+server` renamed to `+app`
  - `+client` renamed to `+script`
  - Instead of exporting the `app` as the default export, you now must export `app.fetch` as a named `handler` export.
  - Removes `page`, `client`, and `server` context variables.
  - `page` is replaced with the `client:page` virtual module.
  - `script` is replaced with the `client:script` virtual module.
  - The `server` context variable is removed. This is better handled by the user - perhaps with libraries like `ofetch`.
  - The `tags` imported from `client:script` are now just strings, so you'll need to pass them through `hono/html` - `raw` function to pass them into a JSX template if you were using them directly in Hono.
  - Multiple `+server` entry points are removed in favor of just one `src/server/+app` entry. Note this is located within `src/server/` now instead of directly in `src/`.
  - Removes `+setup` - since domco no longer mounts routes, user can control the entire lifecycle through the `handler`.
  - Removes default immutable headers - leave to adapters instead.
  - Import `handler` from `dist/server/app.js` instead of the `createApp` export.
  - Script entry points are no longer automatically injected into pages in the same directory.
  - Static pages must be prerendered, nothing from `src/client/` is included in the app if not imported into the server entry.
  - d.ts changes - instead of adding the context variable map, you now just need to add types for the virtual modules from `domco/env`.

  ```ts
  /// <reference types="vite/client" />
  /// <reference types="domco/env" />
  ```

  ## Examples

  ### Vanilla

  ```ts
  import { html } from "client:page";
  import type { Handler } from "domco";

  export const handler: Handler = (req) => {
  	const { pathname } = new URL(req.url);

  	if (pathname === "/") {
  		return new Response(html, { headers: { "Content-Type": "text/html" } });
  	}

  	return new Response("Not found", { status: 404 });
  };
  ```

  ### Hono - Migrate from 0.12

  ```ts
  // src/server/+app.ts
  import { html } from "client:page";
  import { Hono } from "hono";

  const app = new Hono();

  app.use((c) => c.html(html));

  export const handler = app.fetch;
  ```

## 0.12.0

### Minor Changes

- d52d692: Adds `deno deploy` adapter

## 0.11.0

### Minor Changes

- aa4e711: Adds the ability paths to `CreateAppMiddleware`.

  - This is breaking if you are using a custom setup and passing middleware into `createApp`, you now need to specify the `path` in addition to the `handler` passed in. [See example here](https://domco.robino.dev/deploy#example)

## 0.10.0

### Minor Changes

- 07901b2: Adds request listener in place of `@hono/node-server`.

  - This change removes the last remaining dependency for the project other than `vite` and `hono`.
  - Removes `serveStatic` option for `createApp`, use `middleware` instead, see [example](https://domco.robino.dev/deploy#example).

## 0.9.1

### Patch Changes

- 01cdb56: Adds image optimization support for vercel adapter

## 0.9.0

### Minor Changes

- 0f66169: Adds cloudflare adapter.

## 0.8.1

### Patch Changes

- ec46a54: Removes `esbuild` from deps. Dependencies are now bundled during SSR build by default to be compatible with `"webworker"` target.
- ec46a54: stop using node:util `styleText` because it doesn't work in Bun yet, still experimental. Moves engines back to node 20.

## 0.8.0

### Minor Changes

- 418af75: remove node/bun adapter, better to let user configure.
- f9e5cd4: add supported node versions `>= 20.12.0`

### Patch Changes

- 418af75: Remove defu dependency, only used in a couple places where Object.assign works instead
- f9e5cd4: Replace picocolors with built in node `styleText`

## 0.7.0

### Minor Changes

- dea2596: Removes node default build, adds node adapter instead.

  ```js
  import { adapter } from "domco/adapter/node";
  ```

- 66bd2f8: Adds bun adapter

### Patch Changes

- da8740b: Use `configureServer` and add `vite preview` script instead of running node.
- 7370e01: import `process` from "node:process" instead of global
- 7370e01: exports `createAppDev` from "domco/app/dev"

## 0.6.3

### Patch Changes

- 41af98a: Bump dependencies

## 0.6.2

### Patch Changes

- 78a62e5: fix logging output for prerendering /index.html
- 78a62e5: throw error for 404 during prerendering

## 0.6.1

### Patch Changes

- fix: throw errors if prerender paths do not start with /

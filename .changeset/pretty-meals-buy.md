---
"domco": minor
---

Removes dependency on Hono, Hono can still be easily used.

This makes domco have no dependencies other than Vite. You can now use any server framework like Hono that provides a function that handles a web `Request` and returns a `Response`. This update also simplifies domco's API and refactors much of the codebase to make it smaller and builds faster.

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

You can now build your app with vanilla JS without any external libraries.

```ts
import { html } from "client:page";
import type { Handler } from "domco";

export const handler: Handler = (req) => {
	const { pathname } = new URL(req.url);

	if (pathname === "/") {
		return new Response(html, {
			headers: {
				"Content-Type": "text/html",
			},
		});
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



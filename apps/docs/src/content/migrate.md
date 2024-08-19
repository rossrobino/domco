# Migrate

This section will show you how to migrate an existing Vite single page application to become a Hono application. It will use the React template created when running `npm create vite`.

- Run `npm i -D hono domco` in your terminal to install hono and domco as dependencies.
- Add `domco` to your `plugins` array in your `vite.config`.

<!-- // prettier-ignore -->

```ts {3,9}
// vite.config.ts
import react from "@vitejs/plugin-react";
import { domco } from "domco";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		domco(), // add to plugins
		react(),
	],
});
```

- Move `index.html` into `src/` and rename it to `+page.html`.
- Change the `src` attribute of the `script` tag linking to `/src/main.tsx` to `/main.tsx` (alternatively remove the tag entirely and rename `main.tsx` to `+client.tsx`).
- Run `npm run dev` to serve your application - done!
- Now, to add an API route, add types to `/src/vite.env.d.ts`

```ts {3-8}
// /src/vite.env.d.ts
/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
}
```

- Create a `+server.ts` file anywhere within `src/`. In this example, we can make `/src/+server.ts` and serve the app from an endpoint.

```ts
// /src/+server.ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(c.var.page()));

app.get("/api", (c) => c.html("hello world"));

export default app;
```

- `/` is now an API route serving your React SPA application.
- Navigate to `/api` to see the `"hello world"` response from your API.

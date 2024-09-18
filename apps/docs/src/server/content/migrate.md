# Migrate

This section will show you how to migrate an existing Vite single page application to become a Hono application. It will use the React template created when running `npm create vite`.

## Client

- Run `npm i -D domco` in your terminal to install domco as a dependency.
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

- Move `index.html` into `src/client/` and rename it to `+page.html`.
- Move `main.tsx` into `src/client/` and change the `src` attribute of the `script` tag in `+page.html` linking to `/src/main.tsx` to `/client/main.tsx`.
- Add types to `/src/vite.env.d.ts`.

```ts {3}
// /src/vite.env.d.ts
/// <reference types="vite/client" />
/// <reference types="domco/env" />
```

- Create a `src/server/+app.ts` file and serve your page from the endpoint.

```ts
// /src/server/+app.ts
import { html } from "client:page";

export const handler = async (req: Request) => {
	return new Response(
		html, // Your Vite app.
		{
			headers: { "Content-Type": "text/html" },
		},
	);
};
```

- `handler` is now an API route serving your React SPA application.

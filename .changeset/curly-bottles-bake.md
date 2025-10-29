---
"@domcojs/vercel": minor
---

feat: Support Bun runtime

Vercel now supports the [Bun runtime](https://vercel.com/blog/bun-runtime-on-vercel-functions), you can utilize Bun instead of NodeJS by setting `config.runtime` in the Vercel adapter config to `"bun1.x"`.

If you are using a framework like Hono or Elysia, this eliminates the need to convert the web standard Request and Response to a Node compatible one, so you could see faster performance. Vercel outlines the [tradeoffs between the runtimes here](https://vercel.com/blog/bun-runtime-on-vercel-functions#performance-characteristics-and-tradeoffs).

```js
// vite.config.js
import { adapter } from "@domcojs/vercel";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter({
				config: {
					// specify Bun runtime
					runtime: "bun1.x",
				},
			}),
		}),
	],
});
```

---
"domco": major
---

Update server exports.

Instead of exporting a `handler`, you must now export a `default` object with a `fetch` method. This aligns domco with Bun, Deno, and Cloudflare's APIs.

```ts
// src/server/+func
import type { Entry } from "domco";

export default {
	fetch(req) {
		return new Response("Hello world");
	},
} satisfies Entry;
```

The `prerender` export has also moved within the `default` export.

```ts
// src/server/+func
export default {
	fetch(req) {
		return new Response("Hello world");
	},
	prerender: ["/", "/paths..."],
};
```

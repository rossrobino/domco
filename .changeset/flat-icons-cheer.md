---
"domco": major
---

Update server exports

Instead of exporting a `handler`, you must now export a `default` object with a `fetch` method. This aligns domco with Bun, Deno, and Cloudflare's APIs.

```ts
import { html } from "client:page";

export default {
	fetch(req) {
		return new Response(html, { headers: { "content-type": "text/html" } });
	},
};
```

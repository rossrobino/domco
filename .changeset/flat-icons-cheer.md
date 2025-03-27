---
"domco": major
---

Update server exports

Instead of exporting a `handler`, you must now export a `default` object with a `fetch` method. This aligns domco with Bun, Deno, and Cloudflare's APIs.

```ts
// src/server/+func
export default {
	fetch(req) {
		return new Response("Hello world");
	},
};
```

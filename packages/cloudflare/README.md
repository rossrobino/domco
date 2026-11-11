# @domcojs/cloudflare

Deploys a [domco](https://domco.robino.dev) app to [Cloudflare Pages](https://pages.cloudflare.com).

```bash
npm i -D @domcojs/cloudflare
```

```ts
// vite.config.ts
import { adapter } from "@domcojs/cloudflare";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [domco({ adapter: adapter() })] });
```

## Requests

`fetch` receives `(req, info, env, ctx)`. `info.ip` is the client's IP from [`CF-Connecting-IP`](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-connecting-ip), which Cloudflare sets at its edge. `X-Forwarded-For` is not read, since Cloudflare appends to the value a client sends. Cloudflare's [`env` and `ctx`](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/) come third and fourth.

```ts
// src/server/+app.ts
import type { FetchInfo } from "domco";

export default {
	fetch(req: Request, info?: FetchInfo) {
		return new Response(`Hello ${info?.ip}`);
	},
};
```

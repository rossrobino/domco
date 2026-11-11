# @domcojs/vercel

Deploys a [domco](https://domco.robino.dev) app to [Vercel](https://vercel.com) with the [Build Output API](https://vercel.com/docs/build-output-api/v3).

```bash
npm i -D @domcojs/vercel
```

```ts
// vite.config.ts
import { adapter } from "@domcojs/vercel";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [domco({ adapter: adapter() })] });
```

## Runtime

The function runs on `nodejs26.x`, the latest Node.js LTS on Vercel, by default. Choose another [Node.js version](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) or Bun with `config.runtime`.

```ts
adapter({ config: { runtime: "nodejs24.x" } }); // or "bun1.x"
```

## Requests

Vercel ends TLS at its edge and forwards plain HTTP to the function. The adapter uses headers that Vercel sets at its edge, so every runtime (Node.js, Node.js with ISR, and Bun) sees the client's request:

- `req.url` uses the client's protocol from `x-forwarded-proto`.
- `fetch` receives the client's IP as `info.ip` from [`x-forwarded-for`](https://vercel.com/docs/headers/request-headers#x-forwarded-for), which Vercel overwrites to prevent spoofing. Other headers a client can send, such as `x-real-ip`, are not read.

```ts
// src/server/+app.ts
import type { FetchInfo } from "domco";

export default {
	fetch(req: Request, info?: FetchInfo) {
		return new Response(`${req.url} from ${info?.ip}`);
	},
};
```

If another proxy sits in front of Vercel, Vercel may see the proxy's IP instead of the client's. See [using a proxy with Vercel](https://vercel.com/guides/can-i-use-a-proxy-on-top-of-my-vercel-deployment).

# domco

This is the repo for the domco core package. This package exports the Vite plugin.

[Read the documentation](https://domco.robino.dev)

## Client IP

`fetch` receives connection information as its second argument. `info.ip` is the client's IP address, which is never read from a header the client can set.

```ts
// src/server/+app.ts
import type { FetchInfo } from "domco";

export default {
	fetch(req: Request, info?: FetchInfo) {
		return new Response(`Your IP is ${info?.ip}`);
	},
};
```

- The dev and preview servers pass the socket's address.
- Adapters pass the client IP their platform verifies.
- `nodeListener` from `domco/listener` passes the socket's address. Behind a proxy you trust, set `ipHeader` to the header the proxy sets, and `trustForwardedProto` to use its `X-Forwarded-Proto`.

## Builds import the server entry

`vite build` imports `src/server/+app` to read its `prerender` paths, even when there are none. domco loads the project's [`.env` files](https://vite.dev/guide/env-and-mode#env-files) for the build's mode into `process.env` first, without overwriting variables that are already set. If the app checks environment variables as it loads, set them in the build environment or a `.env` file, or check them on the first request.

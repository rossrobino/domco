# Examples

## Server Frameworks

Here are some examples of how to use a few popular server-side frameworks with domco.

### Hono

[Hono](https://hono.dev/) is a fast, lightweight server framework built on Web Standards with support for any JavaScript runtime.

```ts
// src/server/+app.ts
import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export const handler = app.fetch;
```

### h3

[h3](https://h3.unjs.io/) is a server framework built for high performance and portability running in any JavaScript runtime.

```ts
// src/server/+app.ts
import { html } from "client:page";
import { createApp, eventHandler, toWebHandler } from "h3";

const app = createApp();

app.use(eventHandler(() => html));

export const handler = toWebHandler(app);
```

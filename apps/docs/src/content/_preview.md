```ts {7}
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
	c.html(
		c.var.page(), // your Vite app
	),
);

export default app;
```

<br>
<br>
<br>
<br>

**domco** is a library that turns your [Vite](https://vitejs.dev) project into a [Hono](https://hono.dev) application. You can take
advantage of Vite's build pipeline, plugins, and HMR in a full-stack
context using Hono as your web server.

**domco** is inspired by other projects including [HonoX](https://github.com/honojs/honox), [Vinxi](https://vinxi.vercel.app/), and [SvelteKit](https://kit.svelte.dev). It aims to be a minimal layer that connects Vite and Hono, without adding too much to your bundle size.

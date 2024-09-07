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

<h2 class="text-balance">
	Construct Web Applications with
	<span class="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
		Vite
	</span>
	and
	<span class="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
		Hono
	</span>
</h2>

domco turns your [Vite](https://vitejs.dev) project into a [Hono](https://hono.dev) application. You can take advantage of Vite's build pipeline, plugins, and HMR in a full-stack context using Hono as your web server.

This project is inspired by other projects including [HonoX](https://github.com/honojs/honox), [Vinxi](https://vinxi.vercel.app/), and [SvelteKit](https://kit.svelte.dev). domco aims to be a minimal layer that connects Vite and Hono, it has no other dependencies.

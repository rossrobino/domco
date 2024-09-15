```ts {2}
import page from "client:page";
import { Hono } from "hono";

// your Vite app

const app = new Hono();

app.get("/", (c) => c.html(page));

export default app.fetch;
```

<br>
<br>
<br>
<br>

<h2 class="text-balance">
	Create Full-Stack Applications with
	<span class="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
		Vite
	</span>
</h2>

domco turns your [Vite](https://vitejs.dev) project into a [Hono](https://hono.dev) application. You can take advantage of Vite's build pipeline, plugins, and HMR in a full-stack context using Hono as your web server.

This project is inspired by other projects including [HonoX](https://github.com/honojs/honox), [Vinxi](https://vinxi.vercel.app/), and [SvelteKit](https://kit.svelte.dev). domco aims to be a minimal layer that connects Vite and Hono, it has no other dependencies.

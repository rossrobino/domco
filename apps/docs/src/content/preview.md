```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
	c.html(
		// your Vite app
		c.var.page(),
	),
);

export default app;
```

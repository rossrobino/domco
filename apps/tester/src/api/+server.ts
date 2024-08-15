import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
	const res = await c.var.server("/static-page");

	return c.json({ staticHtml: await res.text() });
});

export default app;

// @ts-ignore - no type for SSR
import App from "./App.svelte";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
	// @ts-ignore - no type for SSR
	const result = App.render({ data: {} });
	return c.html(c.var.page().replace("__ROOT__", result.html));
});

export default app;

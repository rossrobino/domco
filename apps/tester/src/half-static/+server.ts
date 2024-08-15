import type { Prerender } from "domco";
import { Hono } from "hono";

export const prerender: Prerender = ["/hola", "/hello"];

const app = new Hono();

app.get("/:param", async (c) => {
	const param = c.req.param();
	return c.html(
		c.var
			.page()
			.replace("__PARAMS__", JSON.stringify(param))
			.replace("__TIME__", new Date().toLocaleString()),
	);
});

export default app;

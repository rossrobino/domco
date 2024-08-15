import { Hono } from "hono";

const app = new Hono();

app.get("/:param", async (c) => {
	return c.html(
		c.var
			.page()
			.replaceAll(
				"__PARAMS__",
				`time: ${Date.now()}\n${JSON.stringify(c.req.param())}`,
			),
	);
});

export default app;

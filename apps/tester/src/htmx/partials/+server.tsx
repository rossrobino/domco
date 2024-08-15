/** @jsxImportSource hono/jsx */
import { Hono } from "hono";

const app = new Hono();

app.get("/rendered-at", async (c) => {
	return c.html(
		<div>
			{c.var.client()}
			<p>Server rendered at {new Date().toLocaleString()}</p>
		</div>,
	);
});

export default app;

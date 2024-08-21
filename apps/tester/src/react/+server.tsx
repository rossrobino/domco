import App from "./App";
import type { Prerender } from "domco";
import { Hono } from "hono";
import React from "react";
import { renderToString } from "react-dom/server";

export const prerender: Prerender = true;

const app = new Hono();

app.get("/", async (c) => {
	return c.html(
		c.var.page().replace(
			"__ROOT__",
			renderToString(
				<React.StrictMode>
					<App />
				</React.StrictMode>,
			),
		),
	);
});

export default app;

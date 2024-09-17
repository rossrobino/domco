import App from "@/client/react/App";
import { html } from "client:page";
import { html as reactHtml } from "client:page/react";
import type { Handler, Prerender } from "domco";
import { Injector } from "domco/injector";
import { Hono } from "hono";
import React from "react";
import { renderToString } from "react-dom/server";

export const prerender: Prerender = ["/static-page", "/half-static/static"];

export const app = new Hono();

app.all("/", async (c) => {
	if (c.req.method === "POST") {
		const formData = await c.req.formData();

		const userInput = formData.get("test");

		console.log(userInput);

		if (typeof userInput === "string" && userInput.length) {
			return c.html(
				new Injector(html).comment([{ text: "result", children: userInput }])
					.html,
			);
		} else {
			return c.html(
				new Injector(html).comment([{ text: "result", children: "invalid" }])
					.html,
			);
		}
	}

	return c.html(html + Date.now());
});

app.get("/static-page", (c) =>
	c.html(`<h1>Static</h1>` + Date.now().toString()),
);

app.get("/dynamic", (c) => c.html(Date.now().toString()));

app.get("/half-static/static", (c) => c.html(Date.now().toString()));
app.get("/half-static/dynamic", (c) => c.html(Date.now().toString()));

app.get("/api", (c) => c.json({ hello: "world" }));

app.get("/react", (c) => {
	return c.html(
		reactHtml.replace(
			"__ROOT__",
			renderToString(
				<React.StrictMode>
					<App />
				</React.StrictMode>,
			),
		),
	);
});

export const handler: Handler = app.fetch;

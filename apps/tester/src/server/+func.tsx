import App from "@/client/react/App";
import { Page } from "@robino/html";
import { html } from "client:page";
import { html as reactHtml } from "client:page/react";
import type { Handler, Prerender } from "domco";
import { Hono } from "hono";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";

export const prerender: Prerender = async () => [
	"/static-page",
	"/half-static/static",
	"/static.css",
	"/static.json",
];

export const app = new Hono();

app.all("/", async (c) => {
	if (c.req.method === "POST") {
		const formData = await c.req.formData();

		const userInput = formData.get("test");

		if (typeof userInput === "string" && userInput.length) {
			return c.html(
				new Page(html).body([{ name: "div", children: "success" }]).toString(),
			);
		} else {
			return c.html(
				new Page(html).body([{ name: "div", children: "invalid" }]).toString(),
			);
		}
	}

	return c.html(html + new Date().toUTCString());
});

app.get("/static.json", (c) => c.json({ prerender: Date.now() }));
app.get("/static.css", (c) => {
	return c.text("h1 { color: blue }", 200, { "content-type": "text/css" });
});

app.get("/static-page", (c) =>
	c.html(`<h1>Static</h1>` + new Date().toUTCString()),
);

app.get("/dynamic", (c) => c.html(new Date().toUTCString()));

app.get("/half-static/*", (c) => c.html(new Date().toUTCString()));

app.get("/api", (c) => c.json({ hello: "world" }));

app.get("/react", (c) => {
	return c.html(
		reactHtml.replace(
			"%root%",
			renderToString(
				<StrictMode>
					<App />
				</StrictMode>,
			),
		),
	);
});

export const handler: Handler = app.fetch;

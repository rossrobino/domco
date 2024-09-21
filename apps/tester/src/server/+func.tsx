import App from "@/client/react/App";
import { html } from "client:page";
import { html as reactHtml } from "client:page/react";
import type { Handler, Prerender } from "domco";
import { Injector } from "domco/injector";
import { Hono } from "hono";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";

export const prerender: Prerender = ["/static-page", "/half-static/static"];

export const app = new Hono();

app.all("/", async (c) => {
	if (c.req.method === "POST") {
		const formData = await c.req.formData();

		const userInput = formData.get("test");

		if (typeof userInput === "string" && userInput.length) {
			return c.html(
				new Injector(html).comment([{ text: "result", children: "success" }])
					.html,
			);
		} else {
			return c.html(
				new Injector(html).comment([{ text: "result", children: "invalid" }])
					.html,
			);
		}
	}

	return c.html(html + new Date().toUTCString());
});

app.get("/static-page", (c) =>
	c.html(`<h1>Static</h1>` + new Date().toUTCString()),
);

app.get("/dynamic", (c) => c.html(new Date().toUTCString()));

app.get("/half-static/static", (c) => c.html(new Date().toUTCString()));
app.get("/half-static/dynamic", (c) => c.html(new Date().toUTCString()));

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

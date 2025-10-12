import { html } from "client:page";
import { html as reactHtml } from "client:page/react";
import { Elysia } from "elysia";
import { Hono } from "hono";

// TEST LONG RUNNING PROCESS EXIT
const elysia = new Elysia();
await elysia.fetch(new Request("http://localhost:4545/"));

const app = new Hono();

app.all("/", async (c) => {
	if (c.req.method === "POST") {
		const formData = await c.req.formData();

		const userInput = formData.get("test");

		if (typeof userInput === "string" && userInput.length) {
			return c.html(html.replace("</body>", (m) => "<div>success</div>" + m));
		} else {
			return c.html(html.replace("</body>", (m) => "<div>invalid</div>" + m));
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

app.get("/react", (c) => c.html(reactHtml));

export default {
	fetch: app.fetch,
	prerender: async () => [
		"/static-page",
		"/half-static/static",
		"/static.css",
		"/static.json",
	],
};

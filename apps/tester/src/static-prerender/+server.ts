import type { Prerender } from "domco";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { processMarkdown } from "robino/util/md";

const content = import.meta.glob("./content/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
});

export const prerender: Prerender = ["/", "/post-1"];

const app = new Hono();

const ssr = createMiddleware<{ Variables: { ssr: string } }>(
	async (c, next) => {
		c.set(
			"ssr",
			c.var
				.page()
				.replace(
					"<!-- target -->",
					`rendered at: ${new Date().toLocaleString()}`,
				),
		);
		await next();
	},
);

app.get("/", ssr, async (c) => {
	return c.html(c.var.ssr);
});

app.get("/:slug", ssr, async (c) => {
	const slug = c.req.param("slug");
	const md = content[`./content/${slug}.md`];

	if (typeof md === "string") {
		return c.html(
			c.var
				.page()
				.replace("<!-- post -->", (await processMarkdown({ md })).html),
		);
	}

	return c.notFound();
});

export default app;

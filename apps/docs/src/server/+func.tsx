import { Edit } from "@/server/components/edit";
import { Hero } from "@/server/components/hero";
import { Layout } from "@/server/components/layout";
import { html as previewHtml } from "@/server/content/_preview.md";
import type { Result } from "@robino/md";
import { tags } from "client:script";
import { version } from "create-domco/package.json";
import { Hono } from "hono";
import { etag } from "hono/etag";

const app = new Hono();

app.use(etag());

app.use(async (c, next) => {
	c.setRenderer(({ title }, content) => {
		return c.html(
			<Layout title={title} tags={tags}>
				{content}
			</Layout>,
		);
	});
	await next();
});

app.get("/", async (c) => {
	return c.render(
		{ title: "domco" },
		<>
			<Hero />
			<section dangerouslySetInnerHTML={{ __html: previewHtml }}></section>
			<div class="my-16 flex justify-center">
				<a href="/tutorial" class="button px-6 py-4 text-lg">
					Get Started
				</a>
			</div>
		</>,
	);
});

const content = import.meta.glob<Result<any>>("/server/content/*.md", {
	eager: true,
});

export const prerender = ["/"];

prerender.push(
	...Object.keys(content)
		.map((filePath) => {
			const slug = filePath.split("/").at(-1)?.split(".").at(0);
			if (slug?.startsWith("_")) return;

			return `/${slug}`;
		})
		.filter((path) => typeof path === "string"),
);

app.get("/:slug", (c) => {
	const slug = c.req.param("slug");
	const path = `/server/content/${slug}.md`;

	const result = content[path];

	if (!result) return c.notFound();

	const html = result.html.replaceAll("__CREATE_VERSION__", version);

	return c.render(
		{
			title: slug.charAt(0).toUpperCase() + slug.slice(1),
		},
		<>
			<section dangerouslySetInnerHTML={{ __html: html }}></section>
			<Edit />
		</>,
	);
});

export default app;

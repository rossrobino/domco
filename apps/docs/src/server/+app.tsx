import { Edit } from "@/server/components/Edit";
import { Hero } from "@/server/components/Hero";
import { Layout } from "@/server/components/Layout";
import { html as previewHtml } from "@/server/content/_preview.md";
import type { Result } from "@robino/md";
import { tags } from "client:script";
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

app.get("/", (c) => {
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

app.get("/:slug", (c) => {
	const slug = c.req.param("slug");
	const path = `/server/content/${slug}.md`;

	const result = content[path];

	if (!result) return c.notFound();

	return c.render(
		{ title: slug.charAt(0).toUpperCase() + slug.slice(1) },
		<>
			<section dangerouslySetInnerHTML={{ __html: result.html }}></section>
			<Edit />
		</>,
	);
});

export default {
	fetch: app.fetch,
	prerender: [
		"/",
		...Object.keys(content)
			.map((filePath) => {
				const slug = filePath.split("/").at(-1)?.split(".").at(0);
				if (slug?.startsWith("_")) return;

				return `/${slug}`;
			})
			.filter((path) => typeof path === "string"),
	],
};

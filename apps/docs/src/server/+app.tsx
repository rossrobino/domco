import { Edit } from "@/server/components/Edit";
import { Hero } from "@/server/components/Hero";
import { Layout } from "@/server/components/Layout";
import * as preview from "@/server/content/_preview.md";
import type { Result } from "@robino/md";
import * as script from "client:script";
import * as style from "client:style";
import { Hono } from "hono";
import { etag } from "hono/etag";

const app = new Hono();

app.use(etag());

app.use(async (c, next) => {
	c.setRenderer(({ title }, content) => {
		return c.html(
			<Layout title={title} tags={script.tags + style.tags}>
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
			<section dangerouslySetInnerHTML={{ __html: preview.html }}></section>
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

app.get("/migrate", (c) =>
	c.redirect("https://github.com/rossrobino/domco-examples", 301),
);

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
			.filter(Boolean),
	],
};

import { Edit } from "@/server/components/Edit";
import { Hero } from "@/server/components/Hero";
import { Layout } from "@/server/components/Layout";
import { html as previewHtml } from "@/server/content/_preview.md";
import { html as apiReferenceHtml } from "@/server/content/generated/globals.md";
import type { Result } from "@robino/md";
import { tags as rootTags } from "client:script";
import { tags as docTags } from "client:script/docs";
import { version } from "create-domco/package.json";
import type { Prerender } from "domco";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { raw } from "hono/html";

const app = new Hono();

app.use(etag());

app.use(async (c, next) => {
	c.setRenderer(({ title, client }, content) => {
		const tags = [raw(rootTags)];
		if (client) {
			tags.push(...client);
		}
		return c.html(
			<Layout title={title} client={tags}>
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
			<section>{raw(previewHtml)}</section>
			<div class="my-16 flex justify-center">
				<a href="/tutorial" class="button px-6 py-4 text-lg">
					Get Started
				</a>
			</div>
		</>,
	);
});

app.get("/api-reference", async (c) => {
	return c.render(
		{ title: "API Reference", client: [raw(docTags)] },
		<>
			<section>
				<h1>API Reference</h1>
				{raw(apiReferenceHtml.replaceAll("globals.md#", "#"))}
			</section>
			<Edit />
		</>,
	);
});

const content = import.meta.glob<Result<any>>("/server/content/*.md", {
	eager: true,
});

const contentPrerender = Object.keys(content)
	.map((filePath) => {
		const slug = filePath.split("/").at(-1)?.split(".").at(0);
		if (slug?.startsWith("_")) return;

		return `/${slug}`;
	})
	.filter((path) => typeof path === "string");

export const prerender: Prerender = [
	"/",
	"/api-reference",
	...contentPrerender,
];

app.get("/:slug", (c) => {
	const slug = c.req.param("slug");
	const path = `/server/content/${slug}.md`;

	const result = content[path];

	if (!result) return c.notFound();

	const html = result.html.replaceAll("__CREATE_VERSION__", version);

	return c.render(
		{
			title: slug.charAt(0).toUpperCase() + slug.slice(1),
			client: [raw(docTags)],
		},
		<>
			<section>{raw(html)}</section>
			<Edit />
		</>,
	);
});

export const handler = app.fetch;

import { Edit } from "@/server/components/Edit";
import { Hero } from "@/server/components/Hero";
import { Layout } from "@/server/components/Layout";
import preview from "@/server/content/_preview.md?raw";
import apiReference from "@/server/generated/globals.md?raw";
import { processMarkdown } from "@robino/md";
import rootTags from "client:tags";
import docTags from "client:tags/docs";
import type { Prerender } from "domco";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { raw } from "hono/html";

export const prerender: Prerender = ["/", "/api-reference"];

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
	const previewHtml = raw(processMarkdown({ md: preview }).html);
	a;
	return c.render(
		{ title: "domco" },
		<>
			<Hero />
			<section>{previewHtml}</section>
			<div class="my-16 flex justify-center">
				<a href="/tutorial" class="button px-6 py-4 text-lg">
					Get Started
				</a>
			</div>
		</>,
	);
});

const content = import.meta.glob("/server/content/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

for (const [fileName, md] of Object.entries(content)) {
	const slug = fileName.split("/").at(-1)?.split(".").at(0);

	if (slug && !slug.startsWith("_")) {
		const html = raw(processMarkdown({ md }).html);

		const pathName = `/${slug}`;

		prerender.push(pathName);

		app.get(pathName, (c) => {
			return c.render(
				{
					title: slug.charAt(0).toUpperCase() + slug.slice(1),
					client: [raw(docTags)],
				},
				<>
					<section>{html}</section>
					<Edit />
				</>,
			);
		});
	}
}

app.get("/api-reference", async (c) => {
	const apiReferenceHtml = raw(
		processMarkdown({ md: apiReference.replaceAll("globals.md#", "#") }).html,
	);

	return c.render(
		{ title: "API Reference", client: [raw(docTags)] },
		<>
			<section>
				<h1>API Reference</h1>
				{apiReferenceHtml}
			</section>
			<Edit />
		</>,
	);
});

export default app.fetch;

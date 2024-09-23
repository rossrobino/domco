import { Edit } from "@/server/components/Edit";
import { Hero } from "@/server/components/Hero";
import { Layout } from "@/server/components/Layout";
import preview from "@/server/content/_preview.md?raw";
import apiReference from "@/server/content/generated/globals.md?raw";
import { MarkdownProcessor } from "@robino/md";
import { tags as rootTags } from "client:script";
import { tags as docTags } from "client:script/docs";
import type { Prerender } from "domco";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { raw } from "hono/html";
import langBash from "shiki/langs/bash.mjs";
import langHtml from "shiki/langs/html.mjs";
import langTsx from "shiki/langs/tsx.mjs";

export const prerender: Prerender = ["/", "/api-reference"];

const mdProcessor = new MarkdownProcessor({
	highlighter: {
		langs: [langTsx, langBash, langHtml],
		langAlias: {
			ts: "tsx",
			js: "tsx",
			jsx: "tsx",
		},
	},
});

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

const previewHtml = raw(mdProcessor.process(preview).html);

app.get("/", async (c) => {
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
		const html = raw(mdProcessor.process(md).html);

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

const apiReferenceHtml = raw(
	mdProcessor.process(apiReference.replaceAll("globals.md#", "#")).html,
);

app.get("/api-reference", async (c) => {
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

export const handler = app.fetch;

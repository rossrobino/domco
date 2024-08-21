import { Hero } from "@/components/Hero";
import preview from "@/content/_preview.md?raw";
import apiReference from "@/generated/globals.md?raw";
import { processMarkdown } from "@robino/md";
import type { Prerender } from "domco";
import { Hono } from "hono";
import { raw } from "hono/html";

export const prerender: Prerender = ["/", "/api-reference"];

const app = new Hono();

app.get("/", async (c) => {
	const previewHtml = raw((await processMarkdown({ md: preview })).html);

	return c.render(
		{ title: "domco" },
		<>
			<Hero />
			<section class="mb-24">{previewHtml}</section>
			<div class="mb-24 flex justify-center">
				<a
					href="/tutorial"
					class="button button-primary p-6 text-lg no-underline"
				>
					Get Started
				</a>
			</div>
		</>,
	);
});

const content = import.meta.glob("/content/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

for (const [fileName, md] of Object.entries(content)) {
	const slug = fileName.split("/").at(-1)?.split(".").at(0);
	if (slug && !slug.startsWith("_")) {
		const html = raw((await processMarkdown({ md })).html);

		const pathName = `/${slug}`;

		prerender.push(pathName);

		app.get(pathName, (c) => {
			return c.render(
				{ title: slug.charAt(0).toUpperCase() + slug.slice(1) },
				<section>{html}</section>,
			);
		});
	}
}

app.get("/api-reference", async (c) => {
	let apiReferenceHtml = raw(
		(await processMarkdown({ md: apiReference.replaceAll("globals.md#", "#") }))
			.html,
	);

	return c.render(
		{ title: "API Reference" },
		<>
			<h1>API Reference</h1>
			<section>{apiReferenceHtml}</section>,
		</>,
	);
});

export default app;

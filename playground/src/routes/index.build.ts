import type { Build } from "html-kit";
import { process } from "robino/util/md";
import { z } from "zod";
import { chunk } from "$lib/util/chunk";
import fs from "fs/promises";

export const build: Build = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	const main = document.querySelector("main");

	// p element with imported content //
	const p = document.createElement("p");
	p.textContent = chunk;
	main?.append(p);

	// custom element //
	customElements.define(
		"custom-element",
		class extends HTMLElement {
			constructor() {
				super();
				this.innerHTML = "<div>A custom element</div>";
			}
		},
	);
	main?.append(document.createElement("custom-element"));

	// processed markdown //
	const md = await fs.readFile("src/lib/content/markdown.md", "utf-8"); // don't use relative paths
	const frontmatterSchema = z
		.object({
			title: z.string(),
			description: z.string(),
		})
		.strict();
	// use any library, this function is a wrapper around `marked`
	const { frontmatter, html } = process(md, frontmatterSchema);

	const title = document.querySelector("#title");
	if (title) title.innerHTML = frontmatter.title;

	const description = document.querySelector("#description");
	if (description) description.innerHTML = frontmatter.description;

	const article = document.querySelector("#md");
	if (article) article.innerHTML = html;

	// return the rendered document, `./index.html` will be updated with the result
	return { document };
};

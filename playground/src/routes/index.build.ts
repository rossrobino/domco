import type { Build } from "html-kit";
import { process } from "robino/util/md";
import { z } from "zod";
import { chunk } from "../lib/chunk";

export const build: Build = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	const main = document.querySelector("main");

	// anchor element
	const anchor = document.createElement("a");
	anchor.textContent = "Build hi";
	anchor.href = "https://robino.dev";
	main?.append(anchor);

	// custom element
	customElements.define(
		"custom-element",
		class extends HTMLElement {
			constructor() {
				super();
				this.innerHTML = "<div>A Custom Element</div>" + chunk;
			}
		},
	);
	main?.append(document.createElement("custom-element"));

	const frontmatterSchema = z
		.object({
			title: z.string(),
			description: z.string(),
		})
		.strict();

	// const md = await fs.readFile("../lib/markdown.md", "utf-8"); // this doesn't work

	const { html } = process("- markdown content", frontmatterSchema);
	const article = document.querySelector("#md");
	if (article) article.innerHTML = html;

	return { document };
};

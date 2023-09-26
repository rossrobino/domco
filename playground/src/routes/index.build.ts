import type { Build } from "../../../packages/domco/dist";
import { process } from "robino/util/md";
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

	// process markdown //
	const md = await fs.readFile("src/lib/content/markdown.md", "utf-8"); // don't use relative paths

	// use any library, this function uses `marked`
	const { html } = process(md);

	const article = document.querySelector("#md");
	if (article) article.innerHTML = html;

	// return the rendered document, `./index.html` will be updated with the result
	return { document };
};

import type { Build } from "domco";
import { process } from "robino/util/md";
import fs from "fs/promises";
import { CustomElement } from "$lib/components/CustomElement";

export const build: Build = async (window) => {
	let { document } = window;

	// custom element //
	await CustomElement(window);

	// process markdown //
	const md = await fs.readFile("src/lib/content/markdown.md", "utf-8"); // don't use relative paths

	// use any library, this function uses `marked`
	const { html } = process(md);

	const article = document.querySelector("#md");
	if (article) article.innerHTML = html;

	// return the rendered document, `./index.html` will be updated with the result
	return document;
};

import { Build } from "domco";
import { process } from "robino/util/md";
import fs from "node:fs/promises";

export const build: Build = async ({ document }) => {
	document.title = "Learn";

	// const md = await fs.readFile(`src/docs/content/${params.slug}.md`, "utf-8");
	const md = await fs.readFile(`src/docs/learn/learn.md`, "utf-8");

	const { html } = process(md);
	const article = document.querySelector("article");
	if (article) article.innerHTML = html;

	const headings = document.querySelectorAll("h2");
	const toc = document.querySelector("#toc");

	headings.forEach((heading) => {
		const el = document.createElement("li");
		el.innerHTML = /*html*/ `
			<a href="#${heading.id}">${heading.textContent}</a>
		`;
		toc?.appendChild(el);
	});
};

import { Build } from "domco";
import { process } from "robino/util/md";
import fs from "node:fs/promises";

export const build: Build = async ({ document }) => {
	document.title = "Modules";

	// const md = await fs.readFile(`src/docs/content/${params.slug}.md`, "utf-8");
	const md = await fs.readFile(`../packages/domco/docs/modules.md`, "utf-8");

	const { html } = process(md);
	const article = document.querySelector("article");
	if (article) article.innerHTML = html;
};

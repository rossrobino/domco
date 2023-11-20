import type { Build } from "domco";
import { process } from "robino/util/md";
import fs from "node:fs/promises";

export const build: Build = async ({ document }) => {
	const md = await fs.readFile(`../packages/domco/docs/modules.md`, "utf-8");

	const { html } = process(md);
	const article = document.querySelector("article");
	if (article) article.innerHTML = html;
};

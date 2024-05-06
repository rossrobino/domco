import type { Config } from "domco";
import { processMarkdown } from "robino/util/md";
import fs from "node:fs/promises";

export const config: Config = {
	build: async ({ document }) => {
		const md = await fs.readFile(`../packages/domco/docs/globals.md`, "utf-8");
		const { html } = await processMarkdown(md);
		const article = document.querySelector("article");
		if (article) article.innerHTML = html;
	},
};

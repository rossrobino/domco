import type { Config } from "domco";
import { process } from "robino/util/md";
import fs from "node:fs/promises";

export const config: Config = {
	build: async ({ document }) => {
		const md = await fs.readFile(`src/docs/learn/index.md`, "utf-8");
		const { html } = await process(md);
		const article = document.querySelector("article");
		if (article) article.innerHTML = html;
	},
};

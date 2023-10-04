import { addBlocks, type Build } from "domco";
import { process } from "robino/util/md";
import fs from "fs/promises";
import { userButton } from "$lib/blocks/userButton";

export const build: Build = async (window) => {
	await addBlocks(window, [userButton]);

	let { document } = window;

	// process markdown //
	const md = await fs.readFile("src/lib/content/markdown.md", "utf-8"); // don't use relative paths

	// use any library, this function uses `marked`
	const { html } = process(md);

	const article = document.querySelector("#md");
	if (article) article.innerHTML = html;
};

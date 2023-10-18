import { Build } from "domco";
import { readFile } from "fs/promises";

export const params = [
	{ postId: "my-post" },
	// { postId: "another-post" },
] as const;

export const build: Build<typeof params> = async ({ document }, { params }) => {
	const h2 = document.querySelector("h2");
	if (h2) h2.textContent = params.postId;
	const md = await readFile(
		"src/lib/content/" + params.postId + ".md",
		"utf-8",
	);
	if (h2) h2.textContent = md;
};

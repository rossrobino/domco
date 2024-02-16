// src/posts/[slug]/index.build.ts
import { Build } from "domco";

export const params = [
	{ slug: "first-post" },
	{ slug: "second-post" },
	{ slug: "third-post" },
] as const;

export const build: Build<typeof params> = async ({ document }, { params }) => {
	const h1 = document.querySelector("h1");
	if (h1) h1.textContent = params.slug; // "first-post" | "second-post" | "third-post"
};

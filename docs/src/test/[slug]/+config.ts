// src/posts/[slug]/index.build.ts
import { Config } from "domco";

const params = [
	{ slug: "first-post" },
	{ slug: "second-post" },
	{ slug: "third-post" },
] as const;

export const config: Config<typeof params> = {
	params,
	build: ({ document }, { params }) => {
		const h1 = document.querySelector("h1");
		if (h1) h1.textContent = params.slug; // "first-post" | "second-post" | "third-post"
	},
};

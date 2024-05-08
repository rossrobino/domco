// src/posts/[slug]/index.build.ts
import { Config } from "domco";

/**
 * Generates an array of objects with slugs from 1 to n.
 * @param count The number of objects to generate.
 * @returns An array of objects with slug properties.
 */
const generateSlugs = (count: number) => {
	const params = [];
	for (let i = 1; i <= count; i++) {
		params.push({ slug: `${i}-post` });
	}
	return params;
};

export const config: Config = {
	params: generateSlugs(2),
	build: ({ document }, { params }) => {
		const h1 = document.querySelector("h1");
		if (h1) h1.textContent = params.slug as string;
	},
};

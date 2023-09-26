import type { Build } from "html-kit";

export const build: Build = async ({ document }) => {
	const p = document.createElement("p");
	p.textContent = "layout.build";
	document.querySelector("main")?.append(p);
	return { document };
};

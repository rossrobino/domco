import { type Build } from "html-kit";

export const build: Build = async ({ document }, { route }) => {
	const p = document.createElement("p");
	p.textContent = `Current route: ${route}`;
	document.querySelector("main")?.append(p);

	return { document };
};

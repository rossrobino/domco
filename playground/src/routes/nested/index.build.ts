import { type Build } from "html-kit";

export const build: Build = async ({ document }, { route }) => {
	const anchor = document.createElement("a");
	anchor.textContent = route;
	anchor.href = "https://robino.dev";
	document.querySelector("main")?.append(anchor);

	return { document };
};

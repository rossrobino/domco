import { type Build } from "../../../packages/domco/dist";

export const build: Build = async ({ document }, { route }) => {
	const h1 = document.querySelector("h1");
	if (h1) {
		h1.textContent = route === "/" ? "home" : route.split("/").join(" ");
	}
	return { document };
};

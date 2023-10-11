import { type Build } from "domco";

export const build: Build = async ({ document }, { route }) => {
	const h1 = document.querySelector("h1");
	if (h1) {
		h1.textContent =
			route.url === "/" ? "home" : route.url.split("/").join(" ");
	}
};

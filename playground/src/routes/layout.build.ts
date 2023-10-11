import { type Build } from "domco";

export const build: Build = async ({ document }, { route }) => {
	const h1 = document.querySelector("h1");
	if (h1) {
		h1.textContent = route === "/" ? "home" : route.split("/").join(" ");
	}
	console.log(h1?.textContent);
	return { document };
};

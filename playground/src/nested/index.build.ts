import { type Build } from "domco";

export const build: Build = async ({ document }) => {
	const div = document.querySelector("#indexBuild");
	if (div) div.textContent = "index.build";
};

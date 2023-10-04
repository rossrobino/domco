import { type Build } from "../../../../dist/domco";

export const build: Build = async ({ document }) => {
	const div = document.querySelector("#indexBuild");
	if (div) div.textContent = "index.build";
	return { document };
};

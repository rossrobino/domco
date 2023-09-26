import { type Build } from "../../../../packages/domco/dist";

export const build: Build = async ({ document }) => {
	const div = document.querySelector("#indexBuild");
	if (div) div.textContent = "index.build";
	return { document };
};

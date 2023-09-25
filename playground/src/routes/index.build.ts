import type { Build } from "html-kit";

export const build: Build = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	const anchor = document.createElement("a");
	const main = document.querySelector("main");

	anchor.textContent = "Build hi";
	anchor.href = "https://robino.dev";
	main?.append(anchor);

	customElements.define(
		"custom-element",
		class extends HTMLElement {
			constructor() {
				super();
				this.innerHTML = "<div>A Custom Element</div>";
			}
		},
	);
	main?.append(document.createElement("custom-element"));

	return { document };
};

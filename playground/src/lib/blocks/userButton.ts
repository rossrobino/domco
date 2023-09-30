import { Block } from "domco";

export const userButton: Block = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	customElements.define(
		"user-button",
		class extends HTMLElement {
			constructor() {
				super();
			}

			connectedCallback() {
				this.setAttribute("role", "button");
				this.classList.add(
					"mb-4",
					"rounded",
					"bg-gray-200",
					"px-3",
					"py-2",
					"inline-block",
				);
				this.addEventListener("click", async () => {
					const res = await fetch("https://randomuser.me/api/");
					const { results } = await res.json();
					const user = results.at(0);

					const div = document.querySelector("#user");
					if (div)
						div.textContent = `${user.name.title}. ${user.name.first} ${user.name.last}`;
				});
			}
		},
	);

	return document.createElement("custom-element");
};

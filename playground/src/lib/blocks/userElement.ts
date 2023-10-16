import { Block } from "domco";

export const userButton: Block = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	customElements.define(
		"user-element",
		class extends HTMLElement {
			constructor() {
				super();
			}
			connectedCallback() {
				let button = this.querySelector("button");
				if (!button) {
					button = document.createElement("button");
					const text = document.createTextNode("Fetch User");
					button.appendChild(text);
					button.classList.add("mb-4", "button", "button-primary");
					this.appendChild(button);
				}
				button.addEventListener("click", async () => {
					const res = await fetch("https://randomuser.me/api/");
					const { results } = await res.json();
					const user = results.at(0);
					const div = document.createElement("div");
					const text = document.createTextNode(
						`${user.name.title}. ${user.name.first} ${user.name.last}`,
					);
					div.appendChild(text);
					this.appendChild(div);
				});
			}
		},
	);
};

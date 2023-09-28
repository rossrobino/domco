import { Element } from "domco";

export const CustomElement: Element = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	const res = await fetch("https://randomuser.me/api/");

	const { results } = await res.json();

	const user = results.at(0);

	const html = /* html */ `
		<div>gender: ${user.gender}</div>
		<div>email: ${user.email}</div>
	`;
	customElements.define(
		"custom-element",
		class extends HTMLElement {
			constructor() {
				super();
			}
			connectedCallback() {
				this.innerHTML = html;
			}
		},
	);
	const customElement = document.createElement("custom-element");
	return customElement;
};

import { Build } from "domco";

export const build: Build = async ({
	document,
	customElements,
	HTMLElement,
}) => {
	const h1 = document.querySelector("h1");
	document.title = "domco" + (h1 ? ` - ${h1.textContent}` : "");

	const headings = document.querySelectorAll("h2, h3, h4, h5");
	headings.forEach((heading) => {
		if (heading && heading.id) {
			const id = heading.id;
			heading.innerHTML = /*html*/ `
				<a href="#${id}" class="not-prose hover:underline flex items-center gap-1">
					${heading.innerHTML}
				</a>
			`;
		}
	});

	customElements.define(
		"table-of-contents",
		class extends HTMLElement {
			constructor() {
				super();
			}

			connectedCallback() {
				const details = document.createElement("details");
				const summary = document.createElement("summary");
				summary.textContent = "On this page";
				details.appendChild(summary);

				const h2s = document.querySelectorAll("h2");

				const ul = document.createElement("ul");

				h2s.forEach((heading) => {
					const a = document.createElement("a");
					a.href = `#${heading.id}`;
					a.textContent = heading.textContent;
					const li = document.createElement("li");
					li.appendChild(a);
					ul.appendChild(li);
				});

				details.appendChild(ul);

				this.appendChild(details);
			}
		},
	);
};

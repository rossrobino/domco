import { Build } from "domco";

export const build: Build = async ({ document }) => {
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
};

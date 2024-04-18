import type { Config } from "domco";
import { processMarkdown } from "robino/util/md";
import fs from "fs/promises";

export const config: Config = {
	build: async ({ document }, { params }) => {
		params;
		const md = await fs.readFile("../README.md", "utf-8");
		const { html } = await processMarkdown(md);
		const article = document.querySelector("article");
		if (article) article.innerHTML = html;
	},

	layoutBuild: async ({ document, customElements, HTMLElement }) => {
		const h1 = document.querySelector("h1");
		document.title = "domco" + (h1 ? ` - ${h1.textContent}` : "");

		const headings = document.querySelectorAll("h2, h3, h4, h5");
		headings.forEach((heading) => {
			if (heading && heading.id) {
				const id = heading.id;
				heading.classList.add("flex");
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
					this.innerHTML = /* html */ `
						<drab-details
							animation-keyframe-from-grid-template-rows="0fr"
							animation-keyframe-to-grid-template-rows="1fr"
						>
							<details class="group overflow-hidden border-b px-4 pb-2 pt-4">
								<summary
									data-trigger
									class="link flex list-none items-center justify-between gap-8 py-2"
								>
									<span>On this page</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="size-4 transition group-[[open]]:rotate-180"
									>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
											clip-rule="evenodd"
										/>
									</svg>
								</summary>
								<div data-content class="grid">
									<div class="toc overflow-hidden"></div>
								</div>
							</details>
						</drab-details>
					`;

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

					document.querySelector(".toc")?.appendChild(ul);
				}
			},
		);
	},

	layout: await fs.readFile("src/layout.html", "utf-8"),
};

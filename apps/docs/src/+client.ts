import "@/style.css";

const headings = document.querySelectorAll("h2, h3");
headings.forEach((heading) => {
	if (heading && heading.id) {
		const id = heading.id;
		heading.classList.add("flex");
		heading.innerHTML = /*html*/ `
			<a href="#${id}" class="flex items-center gap-1">
				${heading.innerHTML}
			</a>
		`;
	}
});

const toCopy = document.querySelectorAll("pre, .copy-text");

toCopy.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

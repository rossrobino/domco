import "@/style.css";

const headings = document.querySelectorAll("h2, h3");
headings.forEach((heading) => {
	if (heading && heading.id) {
		heading.classList.add("flex");

		const anchor = document.createElement("a");
		anchor.href = `#${heading.id}`;
		anchor.classList.add("flex", "items-center", "gap-1");
		anchor.textContent = heading.textContent;

		heading.replaceChildren(anchor);
	}
});

const toCopy = document.querySelectorAll("pre, .copy-text");
toCopy.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

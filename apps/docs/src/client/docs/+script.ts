const headings = document.querySelectorAll("h2, h3");
const tocUl = document.createElement("ul");
tocUl.classList.add("overflow-hidden", "!my-0", "!pl-0");

headings.forEach((heading) => {
	const li = document.createElement("li");
	const link = document.createElement("a");
	link.href = `#${heading.id}`;
	link.textContent = heading.textContent;
	li.append(link);

	if (heading.tagName === "H2") {
		li.classList.add("!list-none", "level-2", "!pl-0");
		tocUl.append(li);
		link.classList.add("no-underline", "font-semibold");
	} else {
		link.classList.add("text-muted-foreground");
		const last = tocUl.querySelector(".level-2:last-child");

		let nestedUl = last?.querySelector("ul");
		if (!nestedUl) {
			nestedUl = document.createElement("ul");
			last?.append(nestedUl);
		}

		nestedUl.append(li);
	}
});

const drabDetails = document.createElement("drab-details");
drabDetails.classList.add("contents");
drabDetails.setAttribute("animation-keyframe-from-grid-template-rows", "0fr");
drabDetails.setAttribute("animation-keyframe-to-grid-template-rows", "1fr");

const details = document.createElement("details");
details.classList.add("group", "overflow-hidden", "border-b", "p-4");

const summary = document.createElement("summary");
summary.classList.add(
	"flex",
	"list-none",
	"items-center",
	"justify-between",
	"gap-8",
	"pt-4",
	"pb-2",
	"cursor-pointer",
	"font-bold",
	"text-lg",
	"underline",
	"underline-offset-2",
);
summary.dataset.trigger = "";
const summaryTitle = document.createElement("span");
summaryTitle.textContent = "On this page";
summary.append(summaryTitle);
summary.insertAdjacentHTML(
	"beforeend",
	`<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="transition group-[[open]]:rotate-180"
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
	`,
);

const content = document.createElement("div");
content.classList.add("grid");
content.dataset.content = "";
content.append(tocUl);

details.append(summary);
details.append(content);
drabDetails.append(details);

let onThisPage = document.querySelector("on-this-page");

if (!onThisPage) {
	// if not explicitly set, append after h1, this is not
	// preferred since it causes layout shift, but some md
	// docs are generated like the API reference
	onThisPage = document.createElement("on-this-page");
	const h1 = document.querySelector("h1");
	h1?.insertAdjacentElement("afterend", onThisPage);
}

onThisPage.append(drabDetails);

const headings = document.querySelectorAll("h2, h3");
const tableOfContents = document.createElement("ul");
tableOfContents.classList.add("overflow-hidden", "!my-0", "!pl-0");

headings.forEach((heading) => {
	const li = document.createElement("li");
	const link = document.createElement("a");
	link.href = `#${heading.id}`;
	link.textContent = heading.textContent;
	li.append(link);

	if (heading.tagName === "H2") {
		li.classList.add("!list-none", "level-2", "!pl-0");
		tableOfContents.append(li);
		link.classList.add("no-underline", "font-bold");
	} else {
		link.classList.add("text-muted-foreground");
		const last = tableOfContents.querySelector(".level-2:last-child");
		console.log(last);

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
details.classList.add("group", "overflow-hidden", "border-b", "p-4", "mb-12");

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
		viewBox="0 0 20 20"
		fill="currentColor"
		class="size-4 transition group-[[open]]:rotate-180"
	>
		<path
			fill-rule="evenodd"
			d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
			clip-rule="evenodd"
		/>
	</svg>`,
);

const content = document.createElement("content");
content.classList.add("grid");
content.dataset.content = "";
content.append(tableOfContents);

details.append(summary);
details.append(content);
drabDetails.append(details);

const h1 = document.querySelector("h1");
h1?.insertAdjacentElement("afterend", drabDetails);

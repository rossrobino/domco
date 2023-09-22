export const build = (document: Document) => {
	const anchor = document.createElement("a");
	anchor.textContent = "Build";
	anchor.href = "https://robino.dev";
	document.querySelector("main")?.append(anchor);

	return document;
};

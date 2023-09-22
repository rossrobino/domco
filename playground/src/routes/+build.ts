// takes in a document (`./index.html`) and returns the modified document
// unless this is imported directly, it will not be included in the final build
export const build = (document: Document) => {
	const anchor = document.createElement("a");
	anchor.textContent = "Build test";
	anchor.href = "https://robino.dev";
	document.querySelector("main")?.append(anchor);

	return document;
};

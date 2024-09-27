import { MarkdownProcessor } from "@robino/md";
import langBash from "shiki/langs/bash.mjs";
import langHtml from "shiki/langs/html.mjs";
import langTsx from "shiki/langs/tsx.mjs";

export const mdProcessor = new MarkdownProcessor({
	highlighter: {
		langs: [langTsx, langBash, langHtml],
		langAlias: {
			ts: "tsx",
			js: "tsx",
			jsx: "tsx",
		},
	},
});

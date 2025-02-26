import { Processor } from "@robino/md";
import langBash from "shiki/langs/bash.mjs";
import langHtml from "shiki/langs/html.mjs";
import langJson from "shiki/langs/json.mjs";
import langTsx from "shiki/langs/tsx.mjs";

export const mdProcessor = new Processor({
	highlighter: {
		langs: [langTsx, langBash, langJson, langHtml],
		langAlias: {
			ts: "tsx",
			js: "tsx",
			jsx: "tsx",
		},
	},
});

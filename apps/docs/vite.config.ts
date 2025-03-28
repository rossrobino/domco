// import { adapter } from "@domcojs/vercel";
import { md } from "@robino/md";
import tailwindcss from "@tailwindcss/vite";
import { domco } from "domco";
import langBash from "shiki/langs/bash.mjs";
import langHtml from "shiki/langs/html.mjs";
import langJson from "shiki/langs/json.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		domco({
			// adapter: adapter({
			// 	images: {
			// 		domains: [],
			// 		sizes: [1280],
			// 		formats: ["image/avif"],
			// 	},
			// 	trailingSlash: false,
			// }),
		}),
		md({
			highlighter: {
				langs: [langTsx, langBash, langJson, langHtml],
				langAlias: {
					ts: "tsx",
					js: "tsx",
					jsx: "tsx",
				},
			},
		}),
	],
});

import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ prettier, tailwind, pm }) => {
	if (!prettier) return [];

	let ignoreContent: string;
	if (pm === "npm") ignoreContent = "package-lock.json\n";
	else if (pm === "pnpm") ignoreContent = "pnpm-lock.yaml\n";
	else ignoreContent = `${pm}.lock\n`;

	return [
		{
			name: "prettier.config.js",
			content: `/** @import { Config } from "prettier" */

/** @type {Config} */
export default {useTabs: true,${
				tailwind ? `plugins: ["prettier-plugin-tailwindcss"],` : ""
			}};`,
		},
		{ name: ".prettierignore", content: ignoreContent },
	];
};

export default getTemplateFiles;

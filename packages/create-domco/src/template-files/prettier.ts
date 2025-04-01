import type { GetTemplateFile } from "../index.js";

export const prettierConfigFileName = "prettier.config.js";

const getTemplateFiles: GetTemplateFile = ({
	prettier,
	tailwind,
	pm,
	adapter,
}) => {
	if (!prettier) return [];

	let ignoreContent = `.DS_Store
node_modules
dist
`;
	if (pm === "npm") ignoreContent += "package-lock.json";
	else if (pm === "pnpm") ignoreContent += "pnpm-lock.yaml";
	else ignoreContent += `${pm}.lock`;

	ignoreContent += "\n";

	if (adapter === "vercel" || adapter === "cloudflare")
		ignoreContent += `.${adapter}\n`;

	return [
		{
			name: prettierConfigFileName,
			content: `/** @import { Config } from "prettier" */

/** @type {Config} */
export default {useTabs: true,${
				tailwind ? `plugins: ["prettier-plugin-tailwindcss"],` : ""
			}};`,
		},
		{
			name: ".prettierignore",
			content: ignoreContent,
		},
	];
};

export default getTemplateFiles;

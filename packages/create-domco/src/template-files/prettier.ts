import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ prettier, tailwind }) => {
	if (!prettier) return [];

	return [
		{
			name: "prettier.config.js",
			contents: `/** @type {import("prettier").Config} */
export default {
	useTabs: true,${
		tailwind ? `\n\tplugins: ["prettier-plugin-tailwindcss"],\n` : ""
	}};\n`,
		},
		{
			name: ".prettierignore",
			contents: `.DS_Store\nnode_modules\n/dist\n.env\n.env.*\npackage-lock.json\npnpm-lock.yaml\nyarn.lock\nbun.lockb\n.vercel\n.cloudflare\n`,
		},
	];
};

export default getTemplateFiles;

import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ prettier, tailwind }) => {
	if (!prettier) return [];

	return [
		{
			name: "prettier.config.js",
			contents: `/** @import { Config } from "prettier" */

/** @type {Config} */
export default {
	useTabs: true,\n${
		tailwind ? `\tplugins: ["prettier-plugin-tailwindcss"],\n` : ""
	}};\n`,
		},
		{
			name: ".prettierignore",
			contents: `.DS_Store\nnode_modules\n/dist\npackage-lock.json\npnpm-lock.yaml\nyarn.lock\nbun.lockb\n.vercel\n.cloudflare\n`,
		},
	];
};

export default getTemplateFiles;

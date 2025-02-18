import type { GetTemplateFile } from "../index.js";

export const prettierConfigFileName = "prettier.config.js";

const getTemplateFiles: GetTemplateFile = ({ prettier, tailwind }) => {
	if (!prettier) return [];

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
			content: `.DS_Store
node_modules
/dist
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lockb
.vercel
.cloudflare
`,
		},
	];
};

export default getTemplateFiles;

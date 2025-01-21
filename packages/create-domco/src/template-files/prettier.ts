import type { GetTemplateFile } from "../index.js";

export const prettierConfigFileName = "prettier.config.js";

const getTemplateFiles: GetTemplateFile = ({ prettier, tailwind }) => {
	if (!prettier) return [];

	return [
		{
			name: prettierConfigFileName,
			contents: `/** @import { Config } from "prettier" */

/** @type {Config} */
export default {useTabs: true,${
				tailwind ? `plugins: ["prettier-plugin-tailwindcss"],` : ""
			}};`,
		},
		{
			name: ".prettierignore",
			contents: `.DS_Store
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

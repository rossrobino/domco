import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = () => {
	return [
		{
			name: "src/env.d.ts",
			content: `/// <reference types="vite/client" />\n/// <reference types="domco/env" />`,
		},
	];
};

export default getTemplateFiles;

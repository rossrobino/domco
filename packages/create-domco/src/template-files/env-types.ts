import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = () => {
	return [
		{
			name: "src/env.d.ts",
			contents: `/// <reference types="vite/client" />
/// <reference types="domco/env" />
`,
		},
	];
};

export default getTemplateFiles;

import type { GetTemplateFile } from "../index.js";

export const styleFileName = {
	base: "client/style.css",
	tailwind: "client/tailwind.css",
} as const;

const getTemplateFiles: GetTemplateFile = ({ tailwind }) => {
	return [
		{
			name: `src/${tailwind ? styleFileName.tailwind : styleFileName.base}`,
			contents: tailwind
				? `@tailwind base;
@tailwind components;
@tailwind utilities;
`
				: ``,
		},
	];
};

export default getTemplateFiles;

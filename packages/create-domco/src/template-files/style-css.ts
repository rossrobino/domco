import type { GetTemplateFile } from "../index.js";

export const styleFileName = "style.css";

const getTemplateFiles: GetTemplateFile = ({ tailwind }) => {
	return [
		{
			name: `src/${styleFileName}`,
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

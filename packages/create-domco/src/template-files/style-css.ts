import type { GetTemplateFile } from "../index.js";

export const styleFileName = {
	base: "client/style.css",
	tailwind: "client/tailwind.css",
} as const;

const getTemplateFiles: GetTemplateFile = ({ tailwind }) => {
	if (tailwind) {
		return [
			{
				name: `src/${styleFileName.tailwind}`,
				contents: `@import "tailwindcss";\n`,
			},
		];
	}

	return [
		{
			name: `src/${styleFileName.base}`,
			contents: "",
		},
	];
};

export default getTemplateFiles;

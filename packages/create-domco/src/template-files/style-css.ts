import type { GetTemplateFile } from "../index.js";

export const styleFileName = {
	base: "client/style.css",
	tailwind: "client/tailwind.css",
} as const;

const getTemplateFiles: GetTemplateFile = ({ tailwind }) => {
	const contents = `@layer base {
	:root {
		color-scheme: light dark;
	}
}
`;

	if (tailwind) {
		return [
			{
				name: `src/${styleFileName.tailwind}`,
				contents: `@import "tailwindcss";\n@source "../";\n\n${contents}`,
			},
		];
	}

	return [
		{
			name: `src/${styleFileName.base}`,
			contents,
		},
	];
};

export default getTemplateFiles;

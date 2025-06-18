import type { GetTemplateFile } from "../index.js";

export const styleFileName = {
	base: "client/style.css",
	tailwind: "client/tailwind.css",
} as const;

const getTemplateFiles: GetTemplateFile = ({ tailwind }) => {
	const content = `@layer base {
	:root {
		color-scheme: light dark;
	}
}
`;

	if (tailwind) {
		return [
			{
				name: `src/${styleFileName.tailwind}`,
				content: `@import "tailwindcss";\n\n${content}`,
			},
		];
	}

	return [{ name: `src/${styleFileName.base}`, content }];
};

export default getTemplateFiles;

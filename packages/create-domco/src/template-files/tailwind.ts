import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, tailwind }) => {
	if (!tailwind) return [];

	return [
		{
			name: `tailwind.config.${lang}`,
			contents: `${
				lang === "ts"
					? `import type { Config } from "tailwindcss";\n`
					: `/** @type {import("tailwindcss").Config} */`
			}
export default {
	content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
}${lang === "ts" ? ` satisfies Config` : ``};
`,
		},
	];
};

export default getTemplateFiles;
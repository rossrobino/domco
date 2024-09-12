import { dependencies } from "../dependencies/index.js";
import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({
	prettier,
	tailwind,
	pm,
	projectName,
}) => {
	if (pm === "deno") return [];

	return [
		{
			name: "package.json",
			contents: `{
	"name": "${projectName}",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"check": "tsc",
		"build": "vite build",
		"preview": "vite preview"${
			prettier ? `,\n\t\t"format": "prettier --write ."` : ""
		}
	},
	"devDependencies": {
		"domco": "^${dependencies.domco}",
		"hono": "^${dependencies.hono}",${prettier ? `\n\t\t"prettier": "^${dependencies.prettier}",` : ""}${
			prettier && tailwind
				? `\n\t\t"prettier-plugin-tailwindcss": "^${dependencies.prettierTailwind}",`
				: ""
		}${
			tailwind
				? `\n\t\t"tailwindcss": "^${dependencies.tailwind}",\n\t\t"autoprefixer": "^${dependencies.autoprefixer}",`
				: ""
		}
		"typescript": "^${dependencies.typescript}",
		"vite": "^${dependencies.vite}"
	}
}
`,
		},
	];
};

export default getTemplateFiles;

import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({
	prettier,
	tailwind,
	pm,
	projectName,
	dependencies,
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
		"preview": "vite preview"
		${prettier ? `,"format": "prettier --write ."` : ""}
	},
	"devDependencies": {
		"domco": "^${dependencies.domco}",
		${prettier ? `"prettier": "^${dependencies.prettier}",` : ""}
		${
			prettier && tailwind
				? `"prettier-plugin-tailwindcss": "^${dependencies.prettierTailwind}",`
				: ""
		}
		${
			tailwind
				? `"tailwindcss": "^${dependencies.tailwind}","autoprefixer": "^${dependencies.autoprefixer}",`
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

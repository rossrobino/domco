import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({
	prettier,
	tailwind,
	pm,
	projectName,
	dependencies,
	adapter,
	framework,
}) => {
	if (pm === "deno") return [];

	// required for vite to run using bun
	// https://bun.com/docs/pm/bunx#shebangs
	const maybeBunPrefix = pm === "bun" ? "bunx --bun " : "";

	return [
		{
			name: "package.json",
			content: `{
	"name": "${projectName}",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"scripts": {
		"dev": "${maybeBunPrefix}vite",
		"check": "${maybeBunPrefix}tsc",
		"build": "${maybeBunPrefix}vite build",
		"preview": "${maybeBunPrefix}vite preview"
		${prettier ? `,"format": "${maybeBunPrefix}prettier --write ."` : ""}
	},${
		framework
			? `"dependencies": {
			"${framework === "remix" ? "@remix-run/fetch-router" : framework}": "^${dependencies[framework]}"${framework === "elysia" ? `,"@elysiajs/html": "^${dependencies.elysiaHtml}"` : ``}
	},`
			: ""
	}"devDependencies": {${adapter ? `"@domcojs/${adapter}": "^${dependencies[adapter]}",` : ""}${tailwind ? `"@tailwindcss/vite": "^${dependencies.tailwind}",` : ""}"domco": "^${dependencies.domco}",${prettier ? `"prettier": "^${dependencies.prettier}",` : ""}
		${
			prettier && tailwind
				? `"prettier-plugin-tailwindcss": "^${dependencies.prettierTailwind}",`
				: ""
		}${
			tailwind ? `"tailwindcss": "^${dependencies.tailwind}",` : ""
		}"typescript": "^${dependencies.typescript}",
		"vite": "^${dependencies.vite}"
	}
}
`,
		},
	];
};

export default getTemplateFiles;

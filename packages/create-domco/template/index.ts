const versions = {
	domco: "0.5.14",
	typesNode: "20.12.10",
	autoprefixer: "10.4.19",
	prettier: "3.2.5",
	prettierTailwind: "0.5.14",
	tailwind: "3.4.3",
	typescript: "5.4.5",
	vite: "5.2.11",
} as const;

export const getFiles = (options: {
	lang: string;
	tailwind: boolean;
	prettier: boolean;
	layout: boolean;
}) => {
	const { lang, tailwind, prettier, layout } = options;

	const styleFileName = tailwind ? "style.postcss" : "style.css";

	const files: { name: string; contents: string }[] = [
		{
			name: "package.json",
			contents: `{
	"name": "domco-project",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "tsc && vite build",
		"preview": "vite preview"${
			prettier ? `,\n\t\t"format": "prettier --write ."` : ``
		}
	},
	"devDependencies": {
		"@types/node": "^${versions.typesNode}",
		"domco": "^${versions.domco}",${prettier ? `\n\t\t"prettier": "^${versions.prettier}",` : ""}${
			prettier && tailwind
				? `\n\t\t"prettier-plugin-tailwindcss": "^${versions.prettierTailwind}",`
				: ""
		}${
			tailwind
				? `\n\t\t"tailwindcss": "^${versions.tailwind}",\n\t\t"autoprefixer": "^${versions.autoprefixer}",`
				: ""
		}
		"typescript": "^${versions.typescript}",
		"vite": "^${versions.vite}"
	}
}
`,
		},
		{
			name: "tsconfig.json",
			contents: `{
	"compilerOptions": {
		"target": "ES2022",
		"useDefineForClassFields": true,
		"module": "ESNext",
		"lib": ["ES2022", "DOM", "DOM.Iterable"],
		"skipLibCheck": true,

		/* Bundler mode */
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,

		/* Linting */
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noUncheckedIndexedAccess": true,
		"noFallthroughCasesInSwitch": true,

		/* Type check JS files */
		"allowJs": true,
		"checkJs": true,

		/* Aliases */
		"paths": {
			"$lib": ["./src/lib"],
			"$lib/*": ["./src/lib/*"]
		}
	},
	"include": ["src"]
}
`,
		},
		{
			name: `vite.config.${lang}`,
			contents: `import { defineConfig } from "vite";
import { domco } from "domco/plugin";
${
	tailwind
		? `import tailwindcss from "tailwindcss";\nimport autoprefixer from "autoprefixer";\n`
		: ``
}
export default defineConfig({
	plugins: [domco()],${
		tailwind
			? `\n\tcss: {\n\t\tpostcss: {\n\t\t\tplugins: [tailwindcss(), autoprefixer()]\n\t\t}\n\t}`
			: ``
	}
});
`,
		},
		{
			name: ".gitignore",
			contents: `node_modules
dist
.env
.env.*
!.env.example
.vscode/*
!.vscode/extensions.json
.DS_Store
`,
		},
		{
			name: layout ? "src/layout.html" : "src/index.html",
			contents: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<link rel="stylesheet" href="/${styleFileName}" />
		<title>Title</title>
		<meta name="description" content="Description" />
	</head>
	<body>${layout ? `<slot></slot>` : ""}</body>
</html>
`,
		},
		{
			name: `src/+config.${lang}`,
			contents: `${layout ? `import fs from "node:fs/promises";\n` : ""}${
				lang === "ts"
					? `import type { Config } from "domco";\n`
					: `/** @type {import("domco").Config} */`
			}
export const config${lang === "ts" ? `: Config` : ""} = {
	build: async ({ document }) => {
		const h1 = document.createElement("h1");
		h1.textContent = "Hello world!";
		document.body.appendChild(h1);
	},${layout ? `\n\n\tlayout: await fs.readFile("src/layout.html", "utf-8"),` : ""}
};
`,
		},
		{
			name: `src/${styleFileName}`,
			contents: tailwind
				? `@tailwind base;
@tailwind components;
@tailwind utilities;
`
				: ``,
		},
		{
			name: "public/favicon.svg",
			contents: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clip-rule="evenodd" /></svg>`,
		},
		{
			name: "src/vite-env.d.ts",
			contents: `/// <reference types="vite/client" />\n`,
		},
	];

	if (prettier) {
		files.push({
			name: "prettier.config.js",
			contents: `/** @type {import("prettier").Config} */
export default {
	useTabs: true,${
		tailwind ? `\n\tplugins: ["prettier-plugin-tailwindcss"],\n` : ""
	}};`,
		});
		files.push({
			name: ".prettierignore",
			contents: `.DS_Store\nnode_modules\n/dist\n.env\n.env.*\npackage-lock.json\npnpm-lock.yaml\nyarn.lock\nbun.lockb\n`,
		});
	}

	if (layout) {
		files.push({
			name: "src/index.html",
			contents: "<!-- wrapped by src/layout.html -->\n",
		});
	}

	if (tailwind) {
		files.push({
			name: `tailwind.config.${lang}`,
			contents: `${
				lang === "ts"
					? `import type { Config } from "tailwindcss";\n`
					: `/** @type {import("tailwindcss").Config} */`
			}
export default {
	content: ["./src/**/*.{html,js,ts}"],
}${lang === "ts" ? ` satisfies Config` : ``};
`,
		});
	}

	return files;
};

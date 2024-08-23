const versions = {
	domco: "0.6.2",
	hono: "4.5.8",
	autoprefixer: "10.4.20",
	prettier: "3.3.3",
	prettierTailwind: "0.5.14",
	tailwind: "3.4.10",
	typescript: "5.5.4",
	vite: "5.4.2",
} as const;

export const getFiles = (options: {
	lang: string;
	tailwind: boolean;
	prettier: boolean;
}) => {
	const { lang, tailwind, prettier } = options;

	const styleFileName = "style.css";

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
		"check": "tsc",
		"build": "vite build",
		"preview": "node dist/server/node.js"${
			prettier ? `,\n\t\t"format": "prettier --write ."` : ``
		}
	},
	"devDependencies": {
		"domco": "^${versions.domco}",
		"hono": "^${versions.hono}",${prettier ? `\n\t\t"prettier": "^${versions.prettier}",` : ""}${
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
		"target": "ESNext",
		"lib": ["ESNext", "DOM", "DOM.Iterable"],
		"skipLibCheck": true,
		"allowJs": true,
		"checkJs": true,
		"module": "Preserve",
		"moduleResolution": "Bundler",
		"verbatimModuleSyntax": true,
		"allowImportingTsExtensions": true,
		"resolveJsonModule": true,
		"moduleDetection": "force",
		"noEmit": true,
		"jsx": "react-jsx",
		"jsxImportSource": "hono/jsx",

		/* Linting */
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedIndexedAccess": true,

		/* Aliases */
		"paths": {
			"@": ["./src"],
			"@/*": ["./src/*"]
		}
	},
	"include": ["src"]
}
`,
		},
		{
			name: `vite.config.${lang}`,
			contents: `import { defineConfig } from "vite";
import { domco } from "domco";
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
			contents: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`,
		},
		{
			name: "src/+page.html",
			contents: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/vite.svg" />
		<link rel="stylesheet" href="/${styleFileName}" />
		<title>Title</title>
		<meta name="description" content="Description" />
	</head>
	<body>hello world</body>
</html>
`,
		},
		{
			name: `src/+server.${lang}`,
			contents: `import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(c.var.page()));

export default app;
`,
		},
		{ name: `src/+client.${lang}`, contents: `console.log("hello world");\n` },
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
			name: "public/vite.svg",
			contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`,
		},
		{
			name: "src/global.d.ts",
			contents: `/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
}
`,
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

	if (tailwind) {
		files.push({
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
		});
	}

	return files;
};

export const getFiles = (lang: string) => {
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
		"preview": "vite preview"
	},
	"devDependencies": {
		"@types/node": "^20.7.0",
		"domco": "^0.0.5",
		"typescript": "^5.2.2",
		"vite": "^4.4.9"
	}
}
`,
		},
		{
			name: "tsconfig.json",
			contents: `{
	"compilerOptions": {
		"target": "ES2020",
		"useDefineForClassFields": true,
		"module": "ESNext",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
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

export default defineConfig({
	plugins: [domco()],
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
			name: "src/routes/index.html",
			contents: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="stylesheet" href="/style.css" />
		<title>Title</title>
	</head>
	<body></body>
</html>
`,
		},
		{
			name: `src/routes/index.build.${lang}`,
			contents: `${
				lang === "ts"
					? `import { type Build } from "domco";\n`
					: `/** @type {import("domco").Build} */`
			}
export const build${lang === "ts" ? `: Build` : ""} = async ({ document }) => {
	document.body.innerHTML = "<h1>Welcome to domco</h1>";
};
`,
		},
		{ name: `src/routes/style.css`, contents: `` },
		{
			name: `src/lib/index.${lang}`,
			contents: `// place files you want to import through the \`$lib\` alias in this folder.\n`,
		},
	];
	return files;
};

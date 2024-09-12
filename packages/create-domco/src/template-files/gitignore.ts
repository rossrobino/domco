import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = () => {
	return [
		{
			name: ".gitignore",
			contents: `logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
node_modules
dist
*.local
.vscode/*
!.vscode/extensions.json
.DS_Store
.vercel
.cloudflare
`,
		},
	];
};

export default getTemplateFiles;

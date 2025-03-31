import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ adapter }) => {
	let content = `.DS_Store
node_modules
dist
.env
.env.*
logs
*.log
*.local
`;

	if (adapter === "vercel" || adapter === "cloudflare")
		content += `.${adapter}\n`;

	return [
		{
			name: ".gitignore",
			content,
		},
	];
};

export default getTemplateFiles;

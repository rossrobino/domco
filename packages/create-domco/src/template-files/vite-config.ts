import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, tailwind, pm }) => {
	// Required in vite 5 since no package.json in deno
	// I think it is fixed in vite 6 - can just use ts
	const ext = pm === "deno" ? `m${lang}` : lang;

	return [
		{
			name: `vite.config.${ext}`,
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
	];
};

export default getTemplateFiles;

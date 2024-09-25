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
		? `import tailwindcss from "tailwindcss"; import autoprefixer from "autoprefixer";`
		: ``
}

export default defineConfig({
	plugins: [domco()],${
		tailwind ? `css: {postcss: {plugins: [tailwindcss(), autoprefixer()]}}` : ``
	}
});
`,
		},
	];
};

export default getTemplateFiles;

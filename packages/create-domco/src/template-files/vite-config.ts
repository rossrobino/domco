import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, tailwind }) => {
	return [
		{
			name: `vite.config.${lang}`,
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

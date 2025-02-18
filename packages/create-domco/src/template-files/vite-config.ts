import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, tailwind }) => {
	return [
		{
			name: `vite.config.${lang}`,
			content: `import { defineConfig } from "vite";
import { domco } from "domco";
${tailwind ? `import tailwindcss from "@tailwindcss/vite";` : ``}

export default defineConfig({
	plugins: [domco()${tailwind ? ", tailwindcss()" : ""}],
});
`,
		},
	];
};

export default getTemplateFiles;

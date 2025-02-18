import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, tailwind, adapter }) => {
	return [
		{
			name: `vite.config.${lang}`,
			content: `${adapter ? `import { adapter } from "@domcojs/${adapter}";` : ``}
${tailwind ? `import tailwindcss from "@tailwindcss/vite";` : ``}
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [domco(${adapter ? `{ adapter: adapter(), }` : ""})${tailwind ? ", tailwindcss()" : ""}],
});
`,
		},
	];
};

export default getTemplateFiles;

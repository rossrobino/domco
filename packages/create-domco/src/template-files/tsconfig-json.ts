import type { GetTemplateFile } from "../index.js";
import { prettierConfigFileName } from "./prettier.js";

const getTemplateFiles: GetTemplateFile = ({ pm, lang, prettier }) => {
	if (pm === "deno") return [];

	return [
		{
			name: "tsconfig.json",
			content: `{
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
	"include": ["vite.config.${lang}",${prettier ? ` "${prettierConfigFileName}",` : ""} "src"]
}
`,
		},
	];
};

export default getTemplateFiles;

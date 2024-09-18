import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ pm }) => {
	if (pm === "deno") return [];

	return [
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
	];
};

export default getTemplateFiles;

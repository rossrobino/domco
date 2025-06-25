import type { GetTemplateFile } from "../index.js";
import { prettierConfigFileName } from "./prettier.js";

const getTemplateFiles: GetTemplateFile = ({
	pm,
	lang,
	prettier,
	framework,
}) => {
	if (pm === "deno") return [];

	let jsxSource: string | undefined;
	if (framework === "ovr") jsxSource = "ovr";
	else if (framework === "hono") jsxSource = "hono/jsx";
	else if (framework === "mono-jsx") jsxSource = "mono-jsx";

	return [
		{
			name: "tsconfig.json",
			content: `{
	"compilerOptions": {
		"target": "ESNext",
		"lib": ["ESNext", "DOM", "DOM.Iterable"],
		"skipLibCheck": true,
		"module": "Preserve",
		"moduleResolution": "Bundler",
		"verbatimModuleSyntax": true,
		"allowImportingTsExtensions": true,
		"resolveJsonModule": true,
		"moduleDetection": "force",
		"noEmit": true,
		"allowJs": true,
		"checkJs": true,

		/* JSX */
		"jsx": "react-jsx",${jsxSource ? `\n\t\t"jsxImportSource": "${jsxSource}",` : ""}

		/* Strict */
		"strict": true,
		"noUnusedLocals": true,
		"noImplicitOverride": true,
		"noUnusedParameters": true,
		"noUncheckedIndexedAccess": true,
		"noFallthroughCasesInSwitch": true,

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

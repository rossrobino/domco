import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ framework }) => {
	let jsxSource: string | undefined;
	if (framework === "ovr") jsxSource = "ovr";
	else if (framework === "hono") jsxSource = "hono/jsx";
	else if (framework === "mono-jsx") jsxSource = "mono-jsx";

	return [
		{
			name: "tsconfig.json",
			content: `{
	"compilerOptions": {
		"rootDir": "\${configDir}",
		"target": "ESNext",
		"lib": ["ESNext", "DOM"],
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
		"jsx": "react-jsx",${jsxSource ? `\n\t\t"jsxImportSource": "${jsxSource}",` : ""}
		"noUnusedLocals": true,
		"noImplicitOverride": true,
		"noUnusedParameters": true,
		"noUncheckedIndexedAccess": true,
		"noFallthroughCasesInSwitch": true,
		"erasableSyntaxOnly": true,
		"paths": {
			"@": ["./src"],
			"@/*": ["./src/*"]
		}
	},
	"include": ["\${configDir}/src", "\${configDir}/*.js", "\${configDir}/*.ts"],
	"exclude": ["\${configDir}/node_modules", "\${configDir}/dist"]
}
`,
		},
	];
};

export default getTemplateFiles;

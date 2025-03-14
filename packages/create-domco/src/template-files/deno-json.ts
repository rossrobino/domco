import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({
	pm,
	prettier,
	tailwind,
	dependencies,
	adapter,
}) => {
	if (pm !== "deno") return [];

	return [
		{
			name: "deno.json",
			content: `{
	"version": "0.0.0",
	"tasks": {
		"dev": "deno run -A npm:vite",
		"check": "deno check src/",
		"build": "deno run -A npm:vite build",
		"preview": "deno run -A npm:vite preview"${
			prettier ? `,\n\t\t"format": "deno run -A npm:prettier --write ."` : ""
		}
	},
	"nodeModulesDir": "manual",
	"imports": {${adapter ? `"@domcojs/${adapter}": "npm:@domcojs/${adapter}@^${dependencies[adapter]}",` : ""}
		${tailwind ? `"@tailwindcss/vite": "npm:@tailwindcss/vite@^${dependencies.tailwind}",` : ""}
		"domco": "npm:domco@^${dependencies.domco}",${prettier ? `\n\t\t"prettier": "npm:prettier@^${dependencies.prettier}",` : ""}${
			prettier && tailwind
				? `\n\t\t"prettier-plugin-tailwindcss": "npm:prettier-plugin-tailwindcss@^${dependencies.prettierTailwind}",`
				: ""
		}${
			tailwind
				? `\n\t\t"tailwindcss": "npm:tailwindcss@^${dependencies.tailwind}",`
				: ""
		}
		"vite": "npm:vite@^${dependencies.vite}"
	},
	"compilerOptions": {
		"checkJs": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedIndexedAccess": true
	}
}
`,
		},
	];
};

export default getTemplateFiles;

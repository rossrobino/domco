import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = () => {
	return [
		{
			name: "src/env.d.ts",
			contents: `/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
}
`,
		},
	];
};

export default getTemplateFiles;

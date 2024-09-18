/** @import { TypeDocOptions } from "typedoc" */
/** @import { PluginOptions } from "typedoc-plugin-markdown" */

/** @type {PluginOptions} */
const markdownOptions = {
	plugin: ["typedoc-plugin-markdown"],
	outputFileStrategy: "modules",
	hidePageHeader: true,
	hidePageTitle: true,
	useHTMLAnchors: true,
};

/** @type {Partial<TypeDocOptions & PluginOptions>} */
export default {
	entryPoints: ["src/index.ts"],
	out: "../../apps/docs/src/server/generated",
	plugin: ["typedoc-plugin-markdown"],
	gitRevision: "main",
	...markdownOptions,
};

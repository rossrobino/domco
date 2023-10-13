import path from "node:path";

export const info = {
	paths: {
		routes: `src${path.sep}routes`,
		outDir: "build",
	},
	files: {
		index: "index",
		layout: "layout",
		indexBuild: "index.build",
		layoutBuild: "layout.build",
	},
} as const;

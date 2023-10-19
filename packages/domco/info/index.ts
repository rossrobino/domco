import path from "node:path";

export const info = {
	paths: {
		root: "src",
		publicDir: path.join(process.cwd(), "public"),
		outDir: path.join(process.cwd(), "dist"),
	},
	files: {
		index: "index",
		layout: "layout",
		indexBuild: "index.build",
		layoutBuild: "layout.build",
	},
} as const;

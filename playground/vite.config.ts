import { defineConfig } from "vite";
import htmlKit from "html-kit";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import typography from "@tailwindcss/typography";
import { uico } from "uico";
import path from "node:path";

export default defineConfig({
	// build: {
	// 	rollupOptions: {
	// 		input: {
	// 			main: path.resolve(__dirname, "src/routes/index.html"),
	// 			nested: path.resolve(__dirname, "src/routes/nested/index.html"),
	// 		},
	// 	},
	// },
	plugins: [htmlKit()],
	css: {
		postcss: {
			plugins: [
				tailwindcss({
					content: ["./src/**/*.{html,js,ts}"],
					plugins: [typography, uico],
				}),
				autoprefixer(),
			],
		},
	},
});

import { defineConfig } from "vite";
import { htmlKit } from "html-kit";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
	plugins: [htmlKit()],
	css: {
		postcss: {
			plugins: [
				tailwindcss(),
				autoprefixer(),
			],
		},
	},
});

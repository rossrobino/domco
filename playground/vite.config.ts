import { defineConfig } from "vite";
import { htmlKit } from "html-kit";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import typography from "@tailwindcss/typography";

export default defineConfig({
	plugins: [htmlKit()],
	css: {
		postcss: {
			plugins: [
				tailwindcss({
					content: ["./src/**/*.{html,js,ts}"],
					plugins: [typography],
				}),
				autoprefixer(),
			],
		},
	},
});

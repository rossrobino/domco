import autoprefixer from "autoprefixer";
import { domco } from "domco";
import { adapter } from "domco/adapter/vercel";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter(),
		}),
	],
	css: {
		postcss: {
			plugins: [tailwindcss(), autoprefixer()],
		},
	},
});

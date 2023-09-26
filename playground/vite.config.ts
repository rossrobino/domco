import { defineConfig } from "vite";
import { domco } from "domco";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
	plugins: [domco()],
	css: {
		postcss: {
			plugins: [tailwindcss(), autoprefixer()],
		},
	},
});

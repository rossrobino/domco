import { defineConfig } from "vite";
import { domco } from "domco/plugin";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { type Plugin } from "postcss";

export default defineConfig({
	plugins: [domco()],
	css: {
		postcss: {
			plugins: [tailwindcss() as Plugin, autoprefixer()],
		},
	},
});

import autoprefixer from "autoprefixer";
import { domco } from "domco";
import { adapter } from "domco/adapter/vercel";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter({
				config: {
					runtime: "edge",
				},
				images: {
					domains: [],
					sizes: [640],
				},
			}),
		}),
	],
	css: {
		postcss: {
			plugins: [tailwindcss(), autoprefixer()],
		},
	},
});

import { adapter } from "@domcojs/vercel";
import autoprefixer from "autoprefixer";
import { domco } from "domco";
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
					sizes: [1280],
					formats: ["image/avif"],
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

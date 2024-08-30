import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import { domco } from "domco";
import { adapter } from "domco/adapter/bun";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter(),
			// adapter: adapter({
			// 	config: {
			// 		runtime: "nodejs20.x",
			// 	},
			// 	isr: { expiration: 60 },
			// }),
		}),
		react(),
		svelte({
			compilerOptions: {
				hydratable: true,
			},
		}),
	],
});

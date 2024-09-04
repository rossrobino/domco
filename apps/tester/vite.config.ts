import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import { domco } from "domco";
import { adapter } from "domco/adapter/vercel";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter({
				config: {
					runtime: "edge",
				},
			}),
		}),
		react(),
		svelte({
			compilerOptions: {
				hydratable: true,
			},
		}),
	],
});

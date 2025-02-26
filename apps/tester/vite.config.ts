import { adapter } from "@domcojs/vercel";
import react from "@vitejs/plugin-react";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter(),
		}),
		react(),
	],
});

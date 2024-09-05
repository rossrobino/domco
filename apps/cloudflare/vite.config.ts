import { domco } from "domco";
import { adapter } from "domco/adapter/cloudflare";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		domco({
			adapter: adapter(),
		}),
	],
});

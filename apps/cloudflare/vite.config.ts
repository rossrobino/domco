import { adapter } from "@domcojs/cloudflare";
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [domco({ adapter: adapter() })] });

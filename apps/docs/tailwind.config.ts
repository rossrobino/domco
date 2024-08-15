import type { Config } from "tailwindcss";
import { uico } from "uico";

export default {
	plugins: [
		uico({
			colorFunction: "oklch",
			colorPalette: "oklch",
		}),
	],
	content: ["./src/**/*.{ts,tsx}"],
} satisfies Config;

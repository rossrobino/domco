import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import { uico } from "uico";

const config: Config = {
	content: ["./src/**/*.{html,js,ts}"],
	plugins: [typography, uico],
};

export default config;

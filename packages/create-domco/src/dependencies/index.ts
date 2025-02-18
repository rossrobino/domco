import { version } from "domco/version";

export const getDependencies = () => {
	return {
		domco: version,
		prettier: "3.5.1",
		prettierTailwind: "0.6.11",
		tailwind: "4.0.6",
		typescript: "5.7.3",
		vite: "6.1.0",
		cloudflare: "1.0.0",
		deno: "1.0.1",
		vercel: "1.0.2",
	};
};

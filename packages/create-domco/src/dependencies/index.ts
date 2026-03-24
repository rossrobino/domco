import { version } from "domco/version";

export const getDependencies = () => {
	return {
		domco: `${version.split(".").at(0)}.0.0`,
		typescript: "6.0.0",
		vite: "8.0.0",

		// framework
		hono: "4.0.0",
		ovr: "6.0.0",
		h3: "2.0.1-rc.19",
		elysia: "1.0.0",
		elysiaHtml: "1.0.0",
		"mono-jsx": "0.7.0", // minor since pre v1
		remix: "3.0.0-alpha.3",

		// adapter
		cloudflare: "2.0.0",
		deno: "2.0.0",
		vercel: "3.0.0",

		// extras
		prettier: "3.0.0",
		prettierTailwind: "0.7.0", // minor since pre v1
		tailwind: "4.0.0",
	} as const;
};

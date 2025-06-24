import { version } from "domco/version";

export const getDependencies = () => {
	return {
		domco: `${version.split(".").at(0)}.0.0`,
		typescript: "5.8.0", // typescript does not follow semver
		vite: "7.0.0",

		// framework
		hono: "4.0.0",
		ovr: "4.0.0",

		// adapter
		cloudflare: "2.0.0",
		deno: "2.0.0",
		vercel: "2.0.0",

		// extras
		prettier: "3.0.0",
		prettierTailwind: "0.6.0", // minor since pre v1
		tailwind: "4.0.0",
	} as const;
};

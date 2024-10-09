import { version } from "domco/version";

export const getDependencies = async () => {
	return {
		domco: version,
		autoprefixer: "10.4.20",
		prettier: "3.3.3",
		prettierTailwind: "0.6.8",
		tailwind: "3.4.13",
		typescript: "5.6.3",
		vite: "5.4.8",
	};
};

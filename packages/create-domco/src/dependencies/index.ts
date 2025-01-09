import { version } from "domco/version";

export const getDependencies = async () => {
	return {
		domco: version,
		autoprefixer: "10.4.20",
		prettier: "3.4.2",
		prettierTailwind: "0.6.9",
		tailwind: "3.4.17",
		typescript: "5.7.3",
		vite: "6.0.7",
	};
};

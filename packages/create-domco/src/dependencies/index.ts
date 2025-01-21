import { version } from "domco/version";

export const getDependencies = async () => {
	return {
		domco: version,
		prettier: "3.4.2",
		prettierTailwind: "0.6.10",
		tailwind: "4.0.0",
		typescript: "5.7.3",
		vite: "6.0.11",
	};
};

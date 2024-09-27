export const getDependencies = async () => {
	let domco = "2.1.0";

	try {
		const res = await fetch("https://registry.npmjs.org/domco/latest", {
			signal: AbortSignal.timeout(5000),
		});
		domco = (await res.json()).version;
	} catch {}

	return {
		domco,
		autoprefixer: "10.4.20",
		prettier: "3.3.3",
		prettierTailwind: "0.6.8",
		tailwind: "3.4.11",
		typescript: "5.6.2",
		vite: "5.4.8",
	};
};

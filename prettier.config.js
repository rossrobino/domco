import config from "robino/config/prettier";

/** @type {import("prettier").Config} */
export default {
	...config,
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
	],
};

import config from "@robino/prettier";

/** @type {import("prettier").Config} */
export default {
	...config,
	plugins: ["prettier-plugin-tailwindcss"],
};

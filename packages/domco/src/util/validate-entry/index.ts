import type { App } from "../../types/index.js";

/**
 * @param mod Entry module to validate
 * @returns Validated default export
 */
export const validateEntry = (mod: Record<string, unknown>) => {
	if (mod.prerender)
		throw new Error(
			"`prerender` must be exported as a property of the `default` export.",
		);

	if (typeof mod.default !== "object" || mod.default == null)
		throw new TypeError(
			"`default` export must be an object with a `fetch` method.",
		);

	if (!("fetch" in mod.default))
		throw new Error("No `fetch` method found on `default` export.");

	return mod.default as App;
};

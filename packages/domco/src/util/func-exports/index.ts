import type { FuncModule } from "../../types/index.js";

export const funcExports = (mod: FuncModule) => {
	if (!mod.default?.fetch) {
		throw new Error("No request `default.fetch` export found.");
	}
	
	return { fetch: mod.default.fetch, prerender: mod.prerender };
};

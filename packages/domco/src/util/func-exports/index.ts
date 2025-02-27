import type { FuncModule, Handler } from "../../types/index.js";

export const funcExports = (mod: FuncModule) => {
	let handler: Handler | undefined;

	if (mod.handler) {
		handler = mod.handler;
	} else {
		throw new Error("No request `handler` export found.");
	}

	return { handler, prerender: mod.prerender };
};

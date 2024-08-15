import type { Prerender } from "../public/index.js";
import type { Hono } from "hono";

/**
 * Exports from server modules.
 */
export type ServerModule = {
	prerender?: Prerender;
	default?: Hono<any>;
};

export type Route = {
	server?: ServerModule;
	page?: string;
	client?: string;
};

export type Routes = Record<string, Route>;

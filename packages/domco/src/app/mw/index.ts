import type { CreateAppOptions } from "../../types/public/index.js";
import { setServer } from "../util/index.js";
import { trimTrailingSlash } from "hono/trailing-slash";

/** Middleware used in `dev` and `prod`. */
export const standardMiddleware: CreateAppOptions["middleware"] = [
	{
		path: "/*",
		handler: setServer,
	},
	{
		path: "/*",
		handler: trimTrailingSlash(),
	},
];

import { dirNames, headers } from "../../constants/index.js";
import type { CreateAppOptions } from "../../types/public/index.js";
import { setServer } from "../util/index.js";
import { trimTrailingSlash } from "hono/trailing-slash";

/** Middleware used in `dev` and `prod`. */
export const standardMiddleware: CreateAppOptions["middleware"] = [
	{
		// this can be applied in `dev` because static files are served directly from `src/`
		path: `/${dirNames.out.client.immutable}/*`,
		handler: async (c, next) => {
			await next();
			c.header("Cache-Control", headers.cacheControl.immutable);
		},
	},
	{
		path: "/*",
		handler: setServer,
	},
	{
		path: "/*",
		handler: trimTrailingSlash(),
	},
];

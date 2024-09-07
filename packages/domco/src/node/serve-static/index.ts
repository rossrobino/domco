/**
 * Used during `preview` only.
 *
 * Adapted from https://github.com/honojs/node-server/blob/main/src/serve-static.ts
 */
import { dirNames } from "../../constants/index.js";
import { createStreamBody } from "../request-listener/index.js";
import { createMiddleware } from "hono/factory";
import {
	getFilePath,
	getFilePathWithoutDefaultDocument,
} from "hono/utils/filepath";
import { getMimeType } from "hono/utils/mime";
import { createReadStream } from "node:fs";
import { lstat } from "node:fs/promises";

export const serveStatic = createMiddleware(async (c, next) => {
	if (c.finalized) {
		return next();
	}

	const root = `./${dirNames.out.base}/${dirNames.out.client.base}`;
	const filename = decodeURIComponent(c.req.path);

	let path = getFilePathWithoutDefaultDocument({ filename, root });

	if (!path) return next();

	path = `./${path}`;

	let stats = await getStats(path);

	if (stats?.isDirectory()) {
		path = getFilePath({ filename, root });

		if (!path) return next();

		path = `./${path}`;

		stats = await getStats(path);
	}

	if (!stats) return next();

	const mime = getMimeType(path);

	if (mime) {
		c.header("Content-Type", mime);
	}

	if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
		c.header("Content-Length", stats.size.toString());
		return c.body(null, 200);
	}

	const range = c.req.header("range") || "";

	if (!range) {
		c.header("Content-Length", stats.size.toString());
		return c.body(createStreamBody(createReadStream(path)), 200);
	}

	// handle range
	c.header("Accept-Ranges", "bytes");
	c.header("Date", stats.birthtime.toUTCString());

	const parts = range.replace(/bytes=/, "").split("-", 2);
	const start = parts[0] ? parseInt(parts[0], 10) : 0;
	let end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
	if (stats.size < end - start + 1) {
		end = stats.size - 1;
	}

	const chunkSize = end - start + 1;
	const stream = createReadStream(path, { start, end });

	c.header("Content-Length", chunkSize.toString());
	c.header("Content-Range", `bytes ${start}-${end}/${stats.size}`);

	return c.body(createStreamBody(stream), 206);
});

const getStats = async (path: string) => {
	try {
		const stats = await lstat(path);
		return stats;
	} catch {
		return null;
	}
};

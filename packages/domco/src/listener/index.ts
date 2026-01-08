// Adapted from:
// https://github.com/mjackson/remix-the-web/blob/main/packages/node-fetch-server
// https://github.com/sveltejs/kit/blob/main/packages/kit/src/exports/node/index.js
// to use as Vite middleware: https://github.com/mjackson/remix-the-web/issues/13
import type { FetchHandler, MaybePromise } from "../types/index.js";
import type {
	IncomingMessage,
	RequestListener,
	ServerResponse,
} from "node:http";

type NodeListenerOptions = {
	/**
	 * Handles an error that occurred during request handling.
	 * May return a `Response` to send to the client, or `void` which creates an early return.
	 *
	 * @param error
	 * @returns A substitute `Response` when an error occurs.
	 */
	onError?: (error: unknown) => MaybePromise<Response | void>;

	/**
	 * A function to perform any cleanup or forward errors that occur during the
	 * response stream, in which case it's too late to send a different `Response`.
	 *
	 * For example in the dev server, it's used to forward the `Error` to Vite.
	 *
	 * @param error
	 */
	onStreamError?: (error: unknown) => any;
};

/**
 * Wraps a fetch handler in a Node.js `http.RequestListener` that can be used with
 * `http.createServer()` or `https.createServer()`.
 */
export const nodeListener = (
	fetch: FetchHandler,
	options?: NodeListenerOptions,
): RequestListener => {
	const onError = options?.onError ?? defaultErrorHandler;

	return async (req, res) => {
		const request = createRequest(req, res);

		let web: Response;

		try {
			web = await fetch(request);
		} catch (error) {
			const errorResponse = await onError(error);
			if (!errorResponse) return; // handled by the user, in this case - Vite middleware via `next(error)`

			web = errorResponse;
		}

		setResponse(res, web, options?.onStreamError);
	};
};

const setResponse = (
	res: ServerResponse,
	web: Response,
	onStreamError?: NodeListenerOptions["onStreamError"],
) => {
	// Iterate over response.headers so we are sure to send multiple Set-Cookie headers correctly.
	// These would incorrectly be merged into a single header if we tried to use
	// `Object.fromEntries(response.headers.entries())`.
	const headers: Record<string, string | string[]> = {};

	for (const [key, value] of web.headers) {
		if (key in headers) {
			if (Array.isArray(headers[key])) {
				headers[key].push(value);
			} else {
				headers[key] = [headers[key]!, value];
			}
		} else {
			headers[key] = value;
		}
	}

	res.writeHead(web.status, headers);

	if (!web.body) {
		res.end();
		return;
	}

	if (web.body.locked) {
		res.end(
			"Fatal error: Response body is locked. " +
				"This can happen when the response was already read (for example through 'response.json()' or 'response.text()').",
		);
		return;
	}

	const reader = web.body.getReader();

	if (res.destroyed) {
		reader.cancel();
		return;
	}

	const cancel = (error?: Error) => {
		res.off("close", cancel);
		res.off("error", cancel);

		reader.cancel(error).catch(() => {});

		if (error) {
			res.destroy(error);
			if (onStreamError) onStreamError(error);
		}
	};

	res.on("close", cancel);
	res.on("error", cancel);

	const next = async () => {
		try {
			while (true) {
				const result = await reader.read();

				if (result.done) break;

				if (!res.write(result.value)) {
					// wait for drain, then run again
					res.once("drain", next);
					return;
				}
			}

			res.end();
		} catch (error) {
			cancel(error instanceof Error ? error : new Error(String(error)));
		}
	};

	next();
};

const createRequest = (req: IncomingMessage, res: ServerResponse) => {
	const controller = new AbortController();
	res.on("close", () => controller.abort());

	const method = req.method ?? "GET";

	const headers = new Headers();
	const rawHeaders = req.rawHeaders;
	for (let i = 0; i < rawHeaders.length; i += 2) {
		const name = rawHeaders[i]!;
		if (name.startsWith(":")) continue;
		headers.append(name, rawHeaders[i + 1]!);
	}

	const protocol =
		"encrypted" in req.socket && req.socket.encrypted ? "https:" : "http:";
	const host = headers.get("Host") ?? "localhost";
	const url = new URL(req.url!, `${protocol}//${host}`);

	// init.duplex = 'half' must be set when body is a ReadableStream, and Node follows the spec.
	// However, this property is not defined in the TypeScript types for RequestInit, so we have
	// to cast it here in order to set it without a type error.
	// See https://fetch.spec.whatwg.org/#dom-requestinit-duplex
	// https://github.com/mdn/content/issues/31735
	const init: RequestInit & { duplex?: "half" } = { method, headers };

	if (method !== "GET" && method !== "HEAD") {
		let cancelled = false;

		init.body = new ReadableStream({
			start(c) {
				req.on("data", (chunk: Buffer) => {
					if (cancelled) return;

					c.enqueue(chunk);

					if (c.desiredSize === null || c.desiredSize <= 0) {
						req.pause();
					}
				});

				req.on("end", () => {
					if (cancelled) return;

					c.close();
				});

				req.on("error", (error) => {
					cancelled = true;
					c.error(error);
				});
			},
			pull() {
				req.resume();
			},
			cancel(reason) {
				cancelled = true;
				req.destroy(reason);
			},
		});

		init.duplex = "half";
	}

	return new Request(url, init);
};

const defaultErrorHandler = (error: unknown) => {
	console.error(error);

	return new Response("Internal Server Error", {
		status: 500,
		headers: { "Content-Type": "text/plain" },
	});
};

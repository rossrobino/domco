// Adapted from:
// https://github.com/remix-run/remix/tree/main/packages/node-fetch-server
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
		let request: Request | undefined;
		try {
			request = createRequest(req, res);
			const web = await fetch(request);

			if (request.signal.aborted || res.destroyed) return;

			setResponse(res, web, options?.onStreamError);
		} catch (error) {
			if (request?.signal.aborted || res.destroyed) return;

			let web: Response | void;
			try {
				web = await onError(error);
			} catch (error) {
				web = defaultErrorHandler(error);
			}

			// The user handled the error, for example by calling Vite's `next(error)`.
			if (!web || request?.signal.aborted || res.destroyed) return;

			try {
				setResponse(res, web, options?.onStreamError);
			} catch (error) {
				const streamError =
					error instanceof Error ? error : new Error(String(error));

				if (res.headersSent) {
					res.destroy(streamError);
					options?.onStreamError?.(streamError);
					return;
				}

				console.error(streamError);
				for (const name of res.getHeaderNames()) res.removeHeader(name);
				res.writeHead(500, { "Content-Type": "text/plain" });
				res.end("Internal Server Error");
			}
		}
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

	if (web.body?.locked && res.req.method !== "HEAD") {
		throw new Error(
			"Fatal error: Response body is locked. " +
				"This can happen when the response was already read (for example through 'response.json()' or 'response.text()').",
		);
	}

	res.writeHead(web.status, web.statusText, headers);

	if (res.req.method === "HEAD") {
		if (web.body && !web.body.locked) web.body.cancel().catch(() => {});
		res.end();
		return;
	}

	if (!web.body) {
		res.end();
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

	void next();
};

const createRequest = (req: IncomingMessage, res: ServerResponse) => {
	const controller = new AbortController();
	let finished = false;
	const abort = (reason?: unknown) => {
		if (!finished) controller.abort(reason);
	};

	res.once("finish", () => (finished = true));
	res.once("close", () => abort());

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

	let host = headers.get("Host") ?? "localhost";
	if (
		!host.includes(":") &&
		(host.startsWith("localhost") || host.startsWith("127.")) &&
		req.socket.localPort
	) {
		host = `${host}:${req.socket.localPort}`;
	}

	const url = new URL(req.url!, `${protocol}//${host}`);

	// init.duplex = 'half' must be set when body is a ReadableStream, and Node follows the spec.
	// However, this property is not defined in the TypeScript types for RequestInit, so we have
	// to cast it here in order to set it without a type error.
	// See https://fetch.spec.whatwg.org/#dom-requestinit-duplex
	// https://github.com/mdn/content/issues/31735
	const init: RequestInit & { duplex?: "half" } = {
		method,
		headers,
		signal: controller.signal,
	};

	if (method !== "GET" && method !== "HEAD") {
		let body: ReadableStreamDefaultController<Uint8Array> | undefined;
		let ended = false;
		let closed = false;

		const cleanup = (keepError = false) => {
			req.off("data", onData);
			req.off("end", onEnd);
			if (!keepError) req.off("error", onError);
			req.off("close", onClose);
		};

		const close = () => {
			if (closed) return;

			closed = true;
			cleanup();
			body?.close();
		};

		const fail = (error: unknown, keepError = false) => {
			if (closed) return;

			closed = true;
			cleanup(keepError);
			abort(error);
			body?.error(error);
		};

		const onData = (chunk: Buffer) => {
			if (!body || closed) return;

			body.enqueue(chunk);

			if (body.desiredSize === null || body.desiredSize <= 0) req.pause();
		};

		const onEnd = () => {
			ended = true;
			close();
		};

		const isAborted = () =>
			req.readableAborted ||
			(req.destroyed && !req.complete && !req.readableEnded);

		const onClose = () => {
			if (!ended) {
				fail(new DOMException("The request was aborted.", "AbortError"), true);
			}
		};
		const onError = (error: Error) => (isAborted() ? onClose() : fail(error));

		init.body = new ReadableStream({
			start(c) {
				body = c;
				req.once("error", onError);

				if (isAborted()) {
					onClose();
					return;
				}

				if (req.readableEnded) {
					ended = true;
					close();
					return;
				}

				req.on("data", onData);
				req.once("end", onEnd);
				req.once("close", onClose);

				if (isAborted()) onClose();
			},
			pull() {
				req.resume();
			},
			cancel() {
				if (closed) return;

				closed = true;
				cleanup();
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

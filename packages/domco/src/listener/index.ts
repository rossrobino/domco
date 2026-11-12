// Adapted from:
// https://github.com/remix-run/remix/tree/main/packages/node-fetch-server
// https://github.com/sveltejs/kit/blob/main/packages/kit/src/exports/node/index.js
// to use as Vite middleware: https://github.com/mjackson/remix-the-web/issues/13
import type { FetchHandler, FetchInfo, MaybePromise } from "../types/index.js";
import type {
	IncomingMessage,
	RequestListener,
	ServerResponse,
} from "node:http";
import { type Http2ServerRequest, constants } from "node:http2";
import { isIP } from "node:net";

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

	/**
	 * Use the `X-Forwarded-Proto` header to set the protocol of the `Request` URL.
	 *
	 * Only enable this when the app runs behind a proxy you trust that always
	 * sets the header, for example a platform that ends TLS before forwarding
	 * plain HTTP to the server. Otherwise clients can set the header themselves.
	 *
	 * When the header is missing or is not `http` or `https`, the protocol
	 * falls back to whether the socket is encrypted.
	 *
	 * @default false
	 */
	trustForwardedProto?: boolean;

	/**
	 * Name of a header that a proxy in front of the server sets to the client's
	 * IP address, for example `"X-Forwarded-For"` or `"X-Real-IP"`.
	 * The last address in the header is passed to `fetch` as `info.ip`, since
	 * that is the one the nearest proxy added.
	 *
	 * Only set this when the app runs behind a proxy you trust that always
	 * overwrites or appends to the header. Otherwise clients can choose their
	 * own IP address.
	 *
	 * When the header is missing or is not a valid IP address, `info.ip`
	 * falls back to the socket's remote address.
	 *
	 * @default undefined // uses the socket's remote address
	 */
	ipHeader?: string;
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
			request = createRequest(req, res, options?.trustForwardedProto);
			const web = await fetch(
				request,
				fetchInfo(req, request.headers, options?.ipHeader),
			);

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
				res.write("Internal Server Error");
				end(res);
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

	// HTTP/2 has no status message, and Node warns when one is passed.
	if (isHttp2(res)) res.writeHead(web.status, headers);
	else res.writeHead(web.status, web.statusText, headers);

	if (res.req.method === "HEAD") {
		if (web.body && !web.body.locked) web.body.cancel().catch(() => {});
		end(res);
		return;
	}

	if (!web.body) {
		end(res);
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

			end(res);
		} catch (error) {
			cancel(error instanceof Error ? error : new Error(String(error)));
		}
	};

	void next();
};

/**
 * @param res Node response
 * @returns whether the response comes from Node's HTTP/2 compatibility API
 */
const isHttp2 = (res: ServerResponse) =>
	"stream" in res.req &&
	Boolean((res.req as unknown as Http2ServerRequest).stream);

/**
 * Ends the response.
 *
 * Over HTTP/2, Node keeps the stream open while the client is still sending a
 * request body that the app paused or never read, so the response never
 * finishes and the client waits on its upload. Once the response has been
 * sent, close the stream with `NO_ERROR`, which tells the client to stop
 * sending the body (RFC 9113 §8.1).
 *
 * The close waits for the stream's `finish` and then a `setImmediate`, as Node
 * does when it closes a stream whose request was never read. `finish` can fire
 * while the response headers are still queued, and closing then makes nghttp2
 * drop them, so the client gets no response. (`res` itself only emits
 * `finish` once the stream has closed, so it can't be used.)
 *
 * The close is skipped when the client has nothing left to send: a request
 * whose headers ended the stream (a GET without a body), a body the app read
 * to the end, or a stream that has already closed.
 *
 * @param res Node response
 */
const end = (res: ServerResponse) => {
	if (isHttp2(res)) {
		const req = res.req as unknown as Http2ServerRequest;
		const stream = req.stream;

		if (!stream.endAfterHeaders) {
			stream.once("finish", () =>
				setImmediate(() => {
					if (req.readableEnded || stream.closed || stream.destroyed) return;

					stream.close(constants.NGHTTP2_NO_ERROR);
				}),
			);
		}
	}

	res.end();
};

const createRequest = (
	req: IncomingMessage,
	res: ServerResponse,
	trustForwardedProto = false,
) => {
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
		(trustForwardedProto && forwardedProtocol(headers)) ||
		("encrypted" in req.socket && req.socket.encrypted ? "https:" : "http:");

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

/**
 * @param headers request headers
 * @returns the first protocol in `X-Forwarded-Proto` if it is `http` or `https`
 */
const forwardedProtocol = (headers: Headers) => {
	const proto = headers
		.get("X-Forwarded-Proto")
		?.split(",", 1)[0]!
		.trim()
		.toLowerCase();

	if (proto === "https" || proto === "http") return `${proto}:` as const;
};

/**
 * @param req Node request
 * @param headers web request headers
 * @param ipHeader trusted header that holds the client IP
 * @returns connection information to pass to `fetch`
 */
const fetchInfo = (
	req: IncomingMessage,
	headers: Headers,
	ipHeader?: string,
): FetchInfo => {
	if (ipHeader) {
		const forwarded = headers.get(ipHeader);
		if (forwarded) {
			const ip = forwarded.slice(forwarded.lastIndexOf(",") + 1).trim();
			if (isIP(ip)) return { ip };
		}
	}

	const ip = req.socket.remoteAddress;

	return ip ? { ip } : {};
};

const defaultErrorHandler = (error: unknown) => {
	console.error(error);

	return new Response("Internal Server Error", {
		status: 500,
		headers: { "Content-Type": "text/plain" },
	});
};

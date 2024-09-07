/**
 * Adapted from https://github.com/mjackson/remix-the-web/blob/main/packages/node-fetch-server
 * to use as middleware: https://github.com/mjackson/remix-the-web/issues/13
 */
import type { MaybePromise } from "../../types/helper/index.js";
import type { ReadStream } from "node:fs";
import type {
	IncomingHttpHeaders,
	IncomingMessage,
	RequestListener,
} from "node:http";

type ClientAddress = {
	/**
	 * The IP address of the client that sent the request.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremoteaddress)
	 */
	address: string;

	/**
	 * The family of the client IP address.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremotefamily)
	 */
	family: IncomingMessage["socket"]["remoteFamily"];

	/**
	 * The remote port of the client that sent the request.
	 *
	 * [Node.js Reference](https://nodejs.org/api/net.html#socketremoteport)
	 */
	port: number;
};

/**
 * A function that handles an incoming request and returns a response.
 *
 * [MDN `Request` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
 *
 * [MDN `Response` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
 */
type FetchHandler = (
	request: Request,
	client: ClientAddress,
) => MaybePromise<Response>;

type RequestListenerOptions = {
	/**
	 * Overrides the host portion of the incoming request URL. By default the request URL host is
	 * derived from the HTTP `Host` header.
	 *
	 * For example, if you have a `$HOST` environment variable that contains the hostname of your
	 * server, you can use it to set the host of all incoming request URLs like so:
	 *
	 * ```ts
	 * createRequestListener(handler, { host: process.env.HOST })
	 * ```
	 */
	host?: string;

	/**
	 * A function that handles an error that occurred during request handling. May return a response to
	 * send to the client, or `void` which creates an early return.
	 *
	 * [MDN `Response` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	onError?: (error: unknown) => MaybePromise<Response | void>;

	/**
	 * Overrides the protocol of the incoming request URL. By default the request URL protocol is
	 * derived from the connection protocol. So e.g. when serving over HTTPS (using
	 * `https.createServer()`), the request URL will begin with `https:`.
	 */
	protocol?: string;
};

/**
 * Wraps a fetch handler in a Node.js `http.RequestListener` that can be used with
 * `http.createServer()` or `https.createServer()`.
 */
export const createRequestListener = (
	handler: FetchHandler,
	options?: RequestListenerOptions,
): RequestListener => {
	const onError = options?.onError ?? defaultErrorHandler;

	return async (req, res) => {
		const protocol =
			options?.protocol ??
			("encrypted" in req.socket && req.socket.encrypted ? "https:" : "http:");
		const host = options?.host ?? req.headers.host ?? "localhost";
		const url = new URL(req.url!, `${protocol}//${host}`);

		const controller = new AbortController();
		res.on("close", () => {
			controller.abort();
		});

		const request = createRequest(req, url, controller.signal);
		const client = {
			address: req.socket.remoteAddress!,
			family: req.socket.remoteFamily!,
			port: req.socket.remotePort!,
		};

		let response: Response;
		try {
			response = await handler(request, client);
		} catch (error) {
			const errorResponse = await onError(error);
			if (!errorResponse) {
				// handled by the user, in this case - Vite middleware via `next(error)`
				return;
			}
			response = errorResponse;
		}

		// Use the rawHeaders API and iterate over response.headers so we are sure to send multiple
		// Set-Cookie headers correctly. These would incorrectly be merged into a single header if we
		// tried to use `Object.fromEntries(response.headers.entries())`.
		const rawHeaders: string[] = [];
		for (let [key, value] of response.headers) {
			rawHeaders.push(key, value);
		}

		res.writeHead(response.status, rawHeaders);

		if (response.body != null && req.method !== "HEAD") {
			// @ts-expect-error
			for await (let chunk of response.body) {
				res.write(chunk);
			}
		}

		res.end();
	};
};

const defaultErrorHandler = (error: unknown) => {
	console.error(error);
	return new Response(
		// "Internal Server Error"
		new Uint8Array([
			73, 110, 116, 101, 114, 110, 97, 108, 32, 83, 101, 114, 118, 101, 114, 32,
			69, 114, 114, 111, 114,
		]),
		{
			status: 500,
			headers: {
				"Content-Type": "text/plain",
			},
		},
	);
};

const createRequest = (req: IncomingMessage, url: URL, signal: AbortSignal) => {
	const init: RequestInit = {
		method: req.method,
		headers: createHeaders(req.headers),
		signal,
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		init.body = createStreamBody(req);

		// init.duplex = 'half' must be set when body is a ReadableStream, and Node follows the spec.
		// However, this property is not defined in the TypeScript types for RequestInit, so we have
		// to cast it here in order to set it without a type error.
		// See https://fetch.spec.whatwg.org/#dom-requestinit-duplex
		(init as { duplex: "half" }).duplex = "half";
	}

	return new Request(url, init);
};

const createHeaders = (incoming: IncomingHttpHeaders) => {
	const headers = new Headers();

	for (const key in incoming) {
		const value = incoming[key];

		if (Array.isArray(value)) {
			for (const item of value) {
				headers.append(key, item);
			}
		} else if (value != null) {
			headers.append(key, value);
		}
	}

	return headers;
};

export const createStreamBody = (req: IncomingMessage | ReadStream) => {
	return new ReadableStream({
		start(controller) {
			req.on("data", (chunk) => {
				controller.enqueue(
					new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength),
				);
			});

			req.on("end", () => {
				controller.close();
			});
		},
	});
};

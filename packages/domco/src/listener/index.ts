// Adapted from https://github.com/mjackson/remix-the-web/blob/main/packages/node-fetch-server
// to use as Vite middleware: https://github.com/mjackson/remix-the-web/issues/13
import type { Handler, MaybePromise } from "../types/index.js";
import type {
	IncomingMessage,
	RequestListener,
	ServerResponse,
} from "node:http";

/**
 * Wraps a fetch handler in a Node.js `http.RequestListener` that can be used with
 * `http.createServer()` or `https.createServer()`.
 */
export const nodeListener = (
	handler: Handler,
	options?: {
		/**
		 * A function that handles an error that occurred during request handling.
		 * May return a response to send to the client, or `void` which creates an early return.
		 */
		onError?: (error: unknown) => MaybePromise<Response | void>;
	},
): RequestListener => {
	const onError = options?.onError ?? defaultErrorHandler;

	return async (req, res) => {
		const request = createRequest(req, res);

		let response: Response;
		try {
			response = await handler(request);
		} catch (error) {
			const errorResponse = await onError(error);
			if (!errorResponse) {
				// handled by the user, in this case - Vite middleware via `next(error)`
				return;
			}
			console.log("test");
			response = errorResponse;
		}

		// Iterate over response.headers so we are sure to send multiple Set-Cookie headers correctly.
		// These would incorrectly be merged into a single header if we tried to use
		// `Object.fromEntries(response.headers.entries())`.
		const headers: Record<string, string | string[]> = {};
		for (const [key, value] of response.headers) {
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

		res.writeHead(response.status, headers);

		if (response.body != null && req.method !== "HEAD") {
			for await (const chunk of readStream(response.body)) {
				res.write(chunk);
			}
		}

		res.end();
	};
};

async function* readStream(stream: ReadableStream<Uint8Array>) {
	const reader = stream.getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		yield value;
	}
}

const defaultErrorHandler = (error: unknown) => {
	console.error(error);

	return new Response("Internal Server Error", {
		status: 500,
		headers: {
			"Content-Type": "text/plain",
		},
	});
};

const createRequest = (req: IncomingMessage, res: ServerResponse) => {
	const controller = new AbortController();
	res.on("close", () => {
		controller.abort();
	});

	const method = req.method ?? "GET";

	const headers = new Headers();
	const rawHeaders = req.rawHeaders;
	for (let i = 0; i < rawHeaders.length; i += 2) {
		headers.append(rawHeaders[i]!, rawHeaders[i + 1]!);
	}

	const protocol =
		"encrypted" in req.socket && req.socket.encrypted ? "https:" : "http:";
	const host = headers.get("Host") ?? "localhost";
	const url = new URL(req.url!, `${protocol}//${host}`);

	// init.duplex = 'half' must be set when body is a ReadableStream, and Node follows the spec.
	// However, this property is not defined in the TypeScript types for RequestInit, so we have
	// to cast it here in order to set it without a type error.
	// See https://fetch.spec.whatwg.org/#dom-requestinit-duplex
	const init: RequestInit & { duplex?: "half" } = {
		method,
		headers,
		signal: controller.signal,
	};

	if (method !== "GET" && method !== "HEAD") {
		init.body = new ReadableStream({
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

		init.duplex = "half";
	}

	return new Request(url, init);
};

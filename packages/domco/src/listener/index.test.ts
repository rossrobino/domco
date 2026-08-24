import { nodeListener } from "./index.js";
import {
	type OutgoingHttpHeaders,
	type RequestListener,
	type Server,
	createServer,
	request as sendRequest,
} from "node:http";
import { afterEach, describe, expect, test, vi } from "vitest";

const servers: Server[] = [];

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			(server) =>
				new Promise<void>((resolve) => {
					server.closeAllConnections();
					server.close(() => resolve());
				}),
		),
	);
});

const start = async (listener: RequestListener) => {
	const server = createServer(listener);
	servers.push(server);

	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			server.off("error", reject);
			resolve();
		});
	});

	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Expected the listener to use a TCP port.");
	}

	return address.port;
};

const call = (
	port: number,
	{
		method = "GET",
		headers,
		body,
	}: { method?: string; headers?: OutgoingHttpHeaders; body?: string } = {},
) =>
	new Promise<{ body: string; headers: string[]; status: number | undefined }>(
		(resolve, reject) => {
			const req = sendRequest(
				{ host: "127.0.0.1", port, path: "/", method, headers },
				(res) => {
					const chunks: Buffer[] = [];
					res.on("data", (chunk: Buffer) => chunks.push(chunk));
					res.once("end", () =>
						resolve({
							body: Buffer.concat(chunks).toString(),
							headers: res.rawHeaders,
							status: res.statusCode,
						}),
					);
				},
			);

			req.once("error", reject);
			req.end(body);
		},
	);

const within = async <T>(promise: Promise<T>) => {
	let timer: NodeJS.Timeout | undefined;

	try {
		return await Promise.race([
			promise,
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error("Listener operation timed out.")),
					1_000,
				);
			}),
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
};

describe("nodeListener", () => {
	test("routes Request construction errors through onError", async () => {
		const onError = vi.fn(() => new Response("Bad request", { status: 400 }));
		const port = await start(
			nodeListener(() => new Response("unreachable"), { onError }),
		);

		const response = await call(port, { headers: { Host: "[" } });

		expect(response.status).toBe(400);
		expect(response.body).toBe("Bad request");
		expect(onError).toHaveBeenCalledOnce();
	});

	test("recovers when Node rejects a web Response header", async () => {
		const onError = vi.fn(() => new Response("Fallback", { status: 500 }));
		const port = await start(
			nodeListener(
				() => new Response("unreachable", { headers: { "X-Test": "\u007f" } }),
				{ onError },
			),
		);

		const response = await call(port);

		expect(response.status).toBe(500);
		expect(response.body).toBe("Fallback");
		expect(onError).toHaveBeenCalledOnce();
	});

	test("does not consume a response stream for HEAD requests", async () => {
		let cancel = () => {};
		const cancelled = new Promise<void>((resolve) => (cancel = resolve));
		const port = await start(
			nodeListener(() => new Response(new ReadableStream({ cancel }))),
		);

		const response = await within(call(port, { method: "HEAD" }));

		expect(response.status).toBe(200);
		expect(response.body).toBe("");
		await within(cancelled);
	});

	test("aborts the Request when the client disconnects", async () => {
		let capture = (_request: Request) => {};
		const captured = new Promise<Request>((resolve) => (capture = resolve));
		const port = await start(
			nodeListener((request) => {
				capture(request);

				return new Promise<Response>((resolve) => {
					request.signal.addEventListener(
						"abort",
						() => resolve(new Response("late")),
						{ once: true },
					);
				});
			}),
		);

		const client = sendRequest({ host: "127.0.0.1", port, path: "/" });
		client.on("error", () => {});
		client.end();

		const request = await within(captured);
		const aborted = new Promise<void>((resolve) =>
			request.signal.addEventListener("abort", () => resolve(), { once: true }),
		);
		client.destroy();

		await within(aborted);
		expect(request.signal.aborted).toBe(true);
	});

	test("rejects body reads when an upload is interrupted", async () => {
		let capture = (_request: Request) => {};
		const captured = new Promise<Request>((resolve) => (capture = resolve));
		let fail = (_error: unknown) => {};
		const failed = new Promise<unknown>((resolve) => (fail = resolve));
		const port = await start(
			nodeListener(async (request) => {
				capture(request);

				try {
					await request.text();
				} catch (error) {
					fail(error);
				}

				return new Response("late");
			}),
		);

		const client = sendRequest({
			host: "127.0.0.1",
			port,
			path: "/",
			method: "POST",
			headers: { "Content-Length": 100 },
		});
		client.on("error", () => {});
		client.write("partial");

		const request = await within(captured);
		client.destroy();
		const error = await within(failed);

		expect(request.signal.aborted).toBe(true);
		expect(error).toBeInstanceOf(DOMException);
		if (!(error instanceof DOMException)) throw error;
		expect(error.name).toBe("AbortError");
	});

	test("does not abort the Request after a normal response", async () => {
		let capture = (_request: Request) => {};
		const captured = new Promise<Request>((resolve) => (capture = resolve));
		const port = await start(
			nodeListener((request) => {
				capture(request);
				return new Response("ok");
			}),
		);

		await call(port);
		const request = await captured;

		expect(request.signal.aborted).toBe(false);
	});

	test("preserves multiple Set-Cookie response headers", async () => {
		const headers = new Headers();
		headers.append("Set-Cookie", "one=1; Path=/");
		headers.append("Set-Cookie", "two=2; Path=/");
		const port = await start(
			nodeListener(() => new Response(null, { headers })),
		);

		const response = await call(port);
		const cookies: string[] = [];
		for (let i = 0; i < response.headers.length; i += 2) {
			if (response.headers[i]?.toLowerCase() === "set-cookie") {
				cookies.push(response.headers[i + 1]!);
			}
		}

		expect(cookies).toStrictEqual(["one=1; Path=/", "two=2; Path=/"]);
	});
});

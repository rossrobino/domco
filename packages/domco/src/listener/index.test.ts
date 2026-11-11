import { nodeListener } from "./index.js";
import {
	type OutgoingHttpHeaders,
	type RequestListener,
	type Server,
	createServer,
	request as sendRequest,
} from "node:http";
import {
	type ClientHttp2Session,
	type Http2Server,
	type ServerHttp2Session,
	connect,
	createServer as createHttp2Server,
} from "node:http2";
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

	test("ignores X-Forwarded-Proto by default", async () => {
		const port = await start(nodeListener((req) => new Response(req.url)));

		const response = await call(port, {
			headers: { Host: "example.com", "X-Forwarded-Proto": "https" },
		});

		expect(response.body).toBe("http://example.com/");
	});

	test("uses X-Forwarded-Proto when trustForwardedProto is set", async () => {
		const port = await start(
			nodeListener((req) => new Response(req.url), {
				trustForwardedProto: true,
			}),
		);

		const https = await call(port, {
			headers: { Host: "example.com", "X-Forwarded-Proto": "HTTPS, http" },
		});
		const invalid = await call(port, {
			headers: { Host: "example.com", "X-Forwarded-Proto": "ftp" },
		});
		const missing = await call(port, { headers: { Host: "example.com" } });

		expect(https.body).toBe("https://example.com/");
		expect(invalid.body).toBe("http://example.com/");
		expect(missing.body).toBe("http://example.com/");
	});

	test("passes the socket's address and ignores client IP headers by default", async () => {
		const port = await start(
			nodeListener((_req, info) => new Response(info?.ip ?? "none")),
		);

		const response = await call(port, {
			headers: { "X-Forwarded-For": "203.0.113.1", "X-Real-IP": "203.0.113.2" },
		});

		expect(response.body).toBe("127.0.0.1");
	});

	test("uses the last address in ipHeader", async () => {
		const port = await start(
			nodeListener((_req, info) => new Response(info?.ip ?? "none"), {
				ipHeader: "X-Forwarded-For",
			}),
		);

		const forwarded = await call(port, {
			headers: { "X-Forwarded-For": "203.0.113.1, 2001:db8::1" },
		});
		// the other header is not trusted
		const other = await call(port, { headers: { "X-Real-IP": "203.0.113.2" } });
		const invalid = await call(port, {
			headers: { "X-Forwarded-For": "not-an-ip" },
		});

		expect(forwarded.body).toBe("2001:db8::1");
		expect(other.body).toBe("127.0.0.1");
		expect(invalid.body).toBe("127.0.0.1");
	});
});

describe("nodeListener over HTTP/2", () => {
	const http2Servers: Http2Server[] = [];
	const sessions: ClientHttp2Session[] = [];
	const serverSessions: ServerHttp2Session[] = [];

	afterEach(async () => {
		for (const session of [
			...sessions.splice(0),
			...serverSessions.splice(0),
		]) {
			session.destroy();
		}
		await Promise.all(
			http2Servers
				.splice(0)
				.map(
					(server) =>
						new Promise<void>((resolve) => server.close(() => resolve())),
				),
		);
	});

	const startHttp2 = async (listener: RequestListener) => {
		const server = createHttp2Server(listener as any);
		http2Servers.push(server);
		server.on("session", (session) => serverSessions.push(session));

		await new Promise<void>((resolve) =>
			server.listen(0, "127.0.0.1", resolve),
		);

		const address = server.address();
		if (!address || typeof address === "string") {
			throw new Error("Expected the listener to use a TCP port.");
		}

		const session = connect(`http://127.0.0.1:${address.port}`);
		sessions.push(session);
		return session;
	};

	const callHttp2 = (
		session: ClientHttp2Session,
		{ method = "GET", body }: { method?: string; body?: Buffer } = {},
	) =>
		new Promise<{ body: string; status: number | undefined }>(
			(resolve, reject) => {
				const stream = session.request({ ":method": method, ":path": "/" });
				let status: number | undefined;
				const chunks: Buffer[] = [];

				stream.once("response", (headers) => (status = headers[":status"]));
				stream.on("data", (chunk: Buffer) => chunks.push(chunk));
				// wait for the whole stream to close, not just the response body,
				// since an unfinished upload keeps the stream open
				stream.once("close", () =>
					resolve({ body: Buffer.concat(chunks).toString(), status }),
				);
				stream.once("error", reject);
				// the server may close the stream before the whole body is sent
				stream.end(body);
			},
		);

	const upload = Buffer.alloc(4.5 * 1024 * 1024, "a");

	test("finishes a response that leaves the request body unread", async () => {
		const session = await startHttp2(
			nodeListener(async () => {
				await new Promise((resolve) => setTimeout(resolve, 300));
				return new Response("Payload Too Large", { status: 413 });
			}),
		);

		const response = await within(
			callHttp2(session, { method: "POST", body: upload }),
		);

		expect(response).toEqual({ body: "Payload Too Large", status: 413 });
	});

	test("sends a whole large response that leaves the request body unread", async () => {
		const size = 3 * 1024 * 1024;
		const session = await startHttp2(
			nodeListener(async () => {
				await new Promise((resolve) => setTimeout(resolve, 300));
				return new Response("a".repeat(size), { status: 413 });
			}),
		);

		const response = await within(
			callHttp2(session, { method: "POST", body: upload }),
		);

		expect(response.status).toBe(413);
		expect(response.body.length).toBe(size);
	});

	test("finishes an empty response that leaves the request body unread", async () => {
		const session = await startHttp2(
			nodeListener(async () => {
				await new Promise((resolve) => setTimeout(resolve, 300));
				return new Response(null, { status: 413 });
			}),
		);

		const response = await within(
			callHttp2(session, { method: "POST", body: upload }),
		);

		expect(response).toEqual({ body: "", status: 413 });
	});

	test("reads the whole request body", async () => {
		const session = await startHttp2(
			nodeListener(
				async (req) =>
					new Response(String((await req.arrayBuffer()).byteLength)),
			),
		);

		const response = await within(
			callHttp2(session, { method: "POST", body: upload }),
		);

		expect(response).toEqual({ body: String(upload.byteLength), status: 200 });
	});

	test("streams a response", async () => {
		const session = await startHttp2(
			nodeListener(
				() =>
					new Response(
						new ReadableStream({
							async start(c) {
								c.enqueue(new TextEncoder().encode("a"));
								await new Promise((resolve) => setTimeout(resolve, 50));
								c.enqueue(new TextEncoder().encode("b"));
								c.close();
							},
						}),
					),
			),
		);

		const response = await within(callHttp2(session));

		expect(response).toEqual({ body: "ab", status: 200 });
	});

	test("does not pass a status message to writeHead", async () => {
		// Node only warns about status messages once per process, so check the call
		const writeHead = vi.fn();
		const listener = nodeListener(
			() => new Response("ok", { statusText: "Fine" }),
		);
		const session = await startHttp2((req, res) => {
			const original = res.writeHead.bind(res);
			res.writeHead = ((...args: Parameters<typeof original>) => {
				writeHead(...args);
				return original(...args);
			}) as typeof res.writeHead;
			return listener(req, res);
		});

		const response = await within(callHttp2(session));

		expect(response).toEqual({ body: "ok", status: 200 });
		expect(writeHead).toHaveBeenCalledOnce();
		expect(writeHead.mock.calls[0]).not.toContain("Fine");
	});
});

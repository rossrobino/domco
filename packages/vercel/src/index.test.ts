import { adapter, fetchInfo, forwardedRequest, getRequest } from "./index.js";
import type { VercelAdapterOptions } from "./types.js";
import fs from "node:fs/promises";
import { type Server, createServer, request as sendRequest } from "node:http";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// run the generated entries against the source instead of `dist`
// (a variable so tsc doesn't pull another package's source into this project)
const listenerSrc = "../../domco/src/listener/index.js";
vi.mock("domco/listener", () => import(listenerSrc));
vi.mock("@domcojs/vercel", () => import("./index.js"));

let dir: string;
let appId: string;
let ipAppId: string;
const servers: Server[] = [];

beforeAll(async () => {
	// inside the package so the entries can resolve their bare imports
	dir = await fs.mkdtemp(path.join(import.meta.dirname, "..", ".test-entry-"));
	appId = path.join(dir, "app.js");
	ipAppId = path.join(dir, "ip-app.js");
	await Promise.all([
		fs.writeFile(
			appId,
			"export default { fetch: (req) => new Response(req.url) };",
		),
		fs.writeFile(
			ipAppId,
			'export default { fetch: (req, info) => new Response(info?.ip ?? "none") };',
		),
	]);
});

afterAll(async () => {
	await Promise.all(
		servers.splice(0).map(
			(server) =>
				new Promise<void>((resolve) => {
					server.closeAllConnections();
					server.close(() => resolve());
				}),
		),
	);
	await fs.rm(dir, { recursive: true, force: true });
});

let count = 0;

/** Writes the adapter's entry to disk and imports its default export. */
const loadEntry = async (options?: VercelAdapterOptions, app = appId) => {
	const { entry } = await adapter(options);
	const { code } = entry!({ appId: app });
	const file = path.join(dir, `main-${count++}.js`);
	await fs.writeFile(file, code);
	return (await import(file)).default;
};

/** Sends a request over a real socket like Vercel forwards from its edge. */
const call = async (
	listener: Parameters<typeof createServer>[1],
	pathname: string,
	headers: Record<string, string>,
	{ method = "GET", body }: { method?: string; body?: string } = {},
) => {
	const server = createServer(listener);
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("No port.");

	return new Promise<string>((resolve, reject) => {
		const req = sendRequest(
			{
				host: "127.0.0.1",
				port: address.port,
				path: pathname,
				method,
				headers,
			},
			(res) => {
				const chunks: Buffer[] = [];
				res.on("data", (chunk: Buffer) => chunks.push(chunk));
				res.once("end", () => resolve(Buffer.concat(chunks).toString()));
			},
		);
		req.once("error", reject);
		req.end(body);
	});
};

const forwarded = { Host: "app.vercel.app", "X-Forwarded-Proto": "https" };

describe("vercel entry", () => {
	test("node entry uses X-Forwarded-Proto", async () => {
		const listener = await loadEntry();

		expect(await call(listener, "/page", forwarded)).toBe(
			"https://app.vercel.app/page",
		);
	});

	test("ISR entry uses X-Forwarded-Proto", async () => {
		const listener = await loadEntry({ isr: { expiration: 60 } });

		const url = await call(listener, "/fn?__pathname=page", forwarded);

		expect(url).toBe("https://app.vercel.app/page");
	});

	test("ISR entry handles requests with a body", async () => {
		const listener = await loadEntry({ isr: { expiration: 60 } });

		const url = await call(listener, "/fn?__pathname=form&a=1", forwarded, {
			method: "POST",
			body: "hello",
		});

		expect(url).toBe("https://app.vercel.app/form?a=1");
	});

	test("bun entry uses X-Forwarded-Proto", async () => {
		const app = await loadEntry({ config: { runtime: "bun1.x" } });

		const res: Response = await app.fetch(
			new Request("http://app.vercel.app/page", { headers: forwarded }),
		);

		expect(await res.text()).toBe("https://app.vercel.app/page");
	});

	test("bun entry keeps the request method and body", async () => {
		const app = await loadEntry({ config: { runtime: "bun1.x" } });
		const res: Response = await app.fetch(
			new Request("http://app.vercel.app/", {
				method: "POST",
				headers: forwarded,
				body: "hello",
			}),
		);

		expect(await res.text()).toBe("https://app.vercel.app/");
	});
});

describe("client IP", () => {
	// Vercel overwrites `x-forwarded-for` at its edge, a client can still send `x-real-ip`
	const headers = {
		"X-Forwarded-For": "203.0.113.1",
		"X-Real-IP": "198.51.100.7",
	};

	test("node entry passes the IP Vercel sets", async () => {
		const listener = await loadEntry(undefined, ipAppId);

		expect(await call(listener, "/", headers)).toBe("203.0.113.1");
	});

	test("node entry falls back to the socket without the header", async () => {
		const listener = await loadEntry(undefined, ipAppId);

		expect(await call(listener, "/", { "X-Real-IP": "198.51.100.7" })).toBe(
			"127.0.0.1",
		);
	});

	test("ISR entry passes the IP Vercel sets", async () => {
		const listener = await loadEntry({ isr: { expiration: 60 } }, ipAppId);

		expect(await call(listener, "/fn?__pathname=", headers)).toBe(
			"203.0.113.1",
		);
	});

	test("bun entry passes the IP Vercel sets", async () => {
		const app = await loadEntry({ config: { runtime: "bun1.x" } }, ipAppId);

		const withHeader: Response = await app.fetch(
			new Request("https://app.vercel.app/", { headers }),
		);
		const without: Response = await app.fetch(
			new Request("https://app.vercel.app/", {
				headers: { "X-Real-IP": "198.51.100.7" },
			}),
		);

		expect(await withHeader.text()).toBe("203.0.113.1");
		expect(await without.text()).toBe("none");
	});

	test("fetchInfo uses the last valid address", () => {
		const info = (value: string) =>
			fetchInfo(
				new Request("https://a/", { headers: { "X-Forwarded-For": value } }),
			);

		expect(info("203.0.113.1, 2001:db8::1")).toStrictEqual({
			ip: "2001:db8::1",
		});
		expect(info("not-an-ip")).toStrictEqual({});
	});
});

describe("runtime", () => {
	test("defaults to the latest Node.js LTS on Vercel", async () => {
		expect(await adapter()).toMatchObject({
			message: "created nodejs26.x build .vercel/",
		});
	});
});

describe("forwardedRequest", () => {
	test("keeps the method, headers, and body", async () => {
		const req = forwardedRequest(
			new Request("http://app.vercel.app/", {
				method: "POST",
				headers: { ...forwarded, "X-Test": "1" },
				body: "hello",
			}),
		);

		expect(req.url).toBe("https://app.vercel.app/");
		expect(req.method).toBe("POST");
		expect(req.headers.get("X-Test")).toBe("1");
		expect(await req.text()).toBe("hello");
	});

	test("returns the same request when no change is needed", () => {
		const plain = new Request("http://app.vercel.app/");
		const secure = new Request("https://app.vercel.app/", {
			headers: forwarded,
		});

		expect(forwardedRequest(plain)).toBe(plain);
		expect(forwardedRequest(secure)).toBe(secure);
	});
});

describe("getRequest", () => {
	test("moves __pathname into the pathname and keeps other params", () => {
		const req = getRequest(
			new Request("https://app.vercel.app/fn?__pathname=a/b&x=1&y=2"),
		);

		expect(req.url).toBe("https://app.vercel.app/a/b?x=1&y=2");
	});

	test("keeps the method, headers, and body", async () => {
		const req = getRequest(
			new Request("https://app.vercel.app/fn?__pathname=", {
				method: "POST",
				headers: { "X-Test": "1" },
				body: "hello",
			}),
		);

		expect(req.url).toBe("https://app.vercel.app/");
		expect(req.method).toBe("POST");
		expect(req.headers.get("X-Test")).toBe("1");
		expect(await req.text()).toBe("hello");
	});
});

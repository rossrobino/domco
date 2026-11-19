import { adapter, fetchInfo, forwardedRequest, getRequest } from "./index.js";
import type { Route, VercelAdapterOptions } from "./types.js";
import { version } from "domco/version";
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

	test("node entry keeps the path and query", async () => {
		const listener = await loadEntry();

		expect(await call(listener, "/weeks?x=1", forwarded)).toBe(
			"https://app.vercel.app/weeks?x=1",
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

	test("bun entry with ISR moves __pathname into the pathname", async () => {
		const app = await loadEntry({
			config: { runtime: "bun1.x" },
			isr: { expiration: 60 },
		});

		const res: Response = await app.fetch(
			new Request("http://app.vercel.app/fn?__pathname=page&x=1", {
				headers: forwarded,
			}),
		);

		expect(await res.text()).toBe("https://app.vercel.app/page?x=1");
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

describe("build output", () => {
	/**
	 * Runs the adapter in a project with a client and server build, the way
	 * `vite build` leaves `dist/`, and returns helpers to read what it wrote.
	 */
	const build = async (options?: VercelAdapterOptions) => {
		const project = await fs.mkdtemp(path.join(dir, "project-"));
		const files: Record<string, string> = {
			"dist/client/index.html": "<h1>home</h1>",
			"dist/client/_immutable/app-3f2a9c1d.js": "console.log(1);",
			"dist/server/app.js": "export default {};",
			"dist/server/main.js": "export default () => {};",
			".vercel/output/stale.txt": "left from the last build",
		};
		for (const [file, content] of Object.entries(files)) {
			await fs.mkdir(path.dirname(path.join(project, file)), {
				recursive: true,
			});
			await fs.writeFile(path.join(project, file), content);
		}

		const cwd = process.cwd();
		process.chdir(project);
		try {
			await (await adapter(options)).run?.();
		} finally {
			process.chdir(cwd);
		}

		const output = path.join(project, ".vercel", "output");
		const read = (file: string) =>
			fs.readFile(path.join(output, file), "utf-8");
		const json = async (file: string) => JSON.parse(await read(file));
		const exists = (file: string) =>
			fs.access(path.join(output, file)).then(
				() => true,
				() => false,
			);

		return { read, json, exists };
	};

	/** Applies a redirect route to a pathname like Vercel does, or `null` if it doesn't match. */
	const redirect = (route: Route, pathname: string) => {
		const location = "headers" in route && route.headers?.Location;
		if (!location || !route.src) throw new Error("Not a redirect route.");

		const match = new RegExp(route.src).exec(pathname);
		if (!match) return null;
		return location.replace(
			/\$(\d)/g,
			(_: string, i: string) => match[Number(i)] ?? "",
		);
	};

	test("writes version 3 of the Build Output API", async () => {
		const { json } = await build();

		expect(await json("config.json")).toMatchObject({
			version: 3,
			framework: { slug: "domco", version },
		});
	});

	test("caches immutable files, serves static files, then the function", async () => {
		const { json } = await build();

		expect((await json("config.json")).routes).toStrictEqual([
			{
				src: "/_immutable/.+",
				headers: { "Cache-Control": "public, immutable, max-age=31536000" },
			},
			{ methods: ["GET"], handle: "filesystem" },
			// Vercel passes the client's path and query to a function it rewrites
			// to, with the query of the rewrite added, so only ISR adds `__pathname`
			{ src: "^/(.*)$", dest: "/fn" },
		]);
	});

	test("rewrites to the function without a query on Bun", async () => {
		const { json } = await build({ config: { runtime: "bun1.x" } });

		expect((await json("config.json")).routes.at(-1)).toStrictEqual({
			src: "^/(.*)$",
			dest: "/fn",
		});
	});

	test("passes the pathname in __pathname with ISR", async () => {
		const { json } = await build({ isr: { expiration: 60 } });

		expect((await json("config.json")).routes.at(-1)).toStrictEqual({
			src: "^/(.*)$",
			dest: "/fn?__pathname=$1",
		});
	});

	test("adds a slash with trailingSlash: true", async () => {
		const { json } = await build({ trailingSlash: true });
		const [add, remove, ...rest] = (await json("config.json"))
			.routes as Route[];

		expect(add).toMatchObject({ status: 308 });
		expect(redirect(add!, "/about")).toBe("/about/");
		expect(redirect(add!, "/blog/post")).toBe("/blog/post/");
		expect(redirect(add!, "/about/")).toBeNull();
		expect(redirect(add!, "/")).toBeNull();
		// files keep their names
		expect(redirect(add!, "/style.css")).toBeNull();

		expect(remove).toMatchObject({ status: 308 });
		expect(redirect(remove!, "/style.css/")).toBe("/style.css");
		expect(redirect(remove!, "/about/")).toBeNull();

		expect(rest).toHaveLength(3);
	});

	test("removes the slash with trailingSlash: false", async () => {
		const { json } = await build({ trailingSlash: false });
		const [remove, ...rest] = (await json("config.json")).routes as Route[];

		expect(remove).toMatchObject({ status: 308 });
		expect(redirect(remove!, "/about/")).toBe("/about");
		expect(redirect(remove!, "/blog/post/")).toBe("/blog/post");
		expect(redirect(remove!, "/about")).toBeNull();
		expect(redirect(remove!, "/")).toBeNull();

		expect(rest).toHaveLength(3);
	});

	test("adds no redirects without trailingSlash", async () => {
		const { json } = await build();

		expect((await json("config.json")).routes).toHaveLength(3);
	});

	test("writes the images config only when it's set", async () => {
		const images = {
			sizes: [640, 1080],
			domains: [],
			formats: ["image/avif" as const],
		};

		expect(
			(await (await build({ images })).json("config.json")).images,
		).toStrictEqual(images);
		expect((await (await build()).json("config.json")).images).toBeUndefined();
	});

	test("configures a Node.js function by default", async () => {
		const { json } = await build();

		expect(await json("functions/fn.func/.vc-config.json")).toStrictEqual({
			handler: "main.js",
			runtime: "nodejs26.x",
			supportsResponseStreaming: true,
			launcherType: "Nodejs",
		});
	});

	test("merges the function config", async () => {
		const { json } = await build({
			config: { runtime: "nodejs24.x", regions: ["cle1"], maxDuration: 30 },
		});

		expect(await json("functions/fn.func/.vc-config.json")).toStrictEqual({
			handler: "main.js",
			runtime: "nodejs24.x",
			supportsResponseStreaming: true,
			launcherType: "Nodejs",
			regions: ["cle1"],
			maxDuration: 30,
		});
	});

	test("configures a Bun function without a launcher", async () => {
		const { json } = await build({ config: { runtime: "bun1.x" } });

		expect(await json("functions/fn.func/.vc-config.json")).toStrictEqual({
			handler: "main.js",
			runtime: "bun1.x",
			supportsResponseStreaming: true,
		});
	});

	test("makes the function an ES module", async () => {
		const { json } = await build();

		expect(await json("functions/fn.func/package.json")).toStrictEqual({
			type: "module",
		});
	});

	test("copies the server into the function and the client into static", async () => {
		const { read } = await build();

		expect(await read("functions/fn.func/main.js")).toBe(
			"export default () => {};",
		);
		expect(await read("functions/fn.func/app.js")).toBe("export default {};");
		expect(await read("static/index.html")).toBe("<h1>home</h1>");
		expect(await read("static/_immutable/app-3f2a9c1d.js")).toBe(
			"console.log(1);",
		);
	});

	test("removes the previous output", async () => {
		const { exists } = await build();

		expect(await exists("stale.txt")).toBe(false);
	});

	test("writes no prerender config without ISR", async () => {
		const { exists } = await build();

		expect(await exists("functions/fn.prerender-config.json")).toBe(false);
	});

	test("writes the prerender config with ISR", async () => {
		const { json } = await build({ isr: { expiration: 60 } });

		expect(await json("functions/fn.prerender-config.json")).toStrictEqual({
			expiration: 60,
			group: 1,
			passQuery: true,
			allowQuery: ["__pathname"],
		});
	});

	test("keeps the ISR options and adds __pathname to allowQuery", async () => {
		const isr = {
			expiration: false as const,
			allowQuery: ["page"],
			passQuery: false,
			bypassToken: "a".repeat(32),
		};
		const { json } = await build({ isr });

		expect(await json("functions/fn.prerender-config.json")).toStrictEqual({
			expiration: false,
			group: 1,
			passQuery: false,
			allowQuery: ["page", "__pathname"],
			bypassToken: "a".repeat(32),
		});
	});

	test("leaves the ISR options as they were", async () => {
		const options = { isr: { expiration: 60, allowQuery: ["page"] } };
		const adapterOptions = await adapter(options);

		const project = await fs.mkdtemp(path.join(dir, "project-"));
		const cwd = process.cwd();
		process.chdir(project);
		try {
			await adapterOptions.run?.();
			await adapterOptions.run?.();
		} finally {
			process.chdir(cwd);
		}

		expect(options.isr.allowQuery).toStrictEqual(["page"]);
		expect(
			JSON.parse(
				await fs.readFile(
					path.join(
						project,
						".vercel/output/functions/fn.prerender-config.json",
					),
					"utf-8",
				),
			).allowQuery,
		).toStrictEqual(["page", "__pathname"]);
	});
});

describe("image middleware", () => {
	type Next = (error?: unknown) => void;

	/** Calls the dev middleware with a request for `url`. */
	const handle = async (url: string, options?: VercelAdapterOptions) => {
		const { devMiddleware, previewMiddleware } = await adapter(options);
		expect(previewMiddleware).toStrictEqual(devMiddleware);

		const res = { status: 0, headers: {} as Record<string, string> };
		let error: unknown;
		let nextCalled = false;

		await new Promise<void>((resolve) => {
			const next: Next = (e) => {
				nextCalled = true;
				error = e;
				resolve();
			};
			const middleware = devMiddleware![0]! as unknown as (
				req: { url: string },
				res: unknown,
				next: Next,
			) => void;
			middleware(
				{ url },
				{
					writeHead(status: number, headers: Record<string, string>) {
						res.status = status;
						res.headers = headers;
					},
					end: () => resolve(),
				},
				next,
			);
		});

		return { res, error, nextCalled };
	};

	const images = { sizes: [640, 1080], domains: [] };

	test("redirects to the source image in dev", async () => {
		const { res, nextCalled } = await handle(
			"/_vercel/image?url=%2Fimages%2Fa.png&w=640&q=75",
			{ images },
		);

		expect(nextCalled).toBe(false);
		expect(res).toStrictEqual({
			status: 302,
			headers: { Location: "/images/a.png" },
		});
	});

	test("rejects a width that isn't in sizes", async () => {
		const { error } = await handle("/_vercel/image?url=/a.png&w=700&q=75", {
			images,
		});

		expect(String(error)).toContain("`700` is not an included image size");
	});

	test("asks for each missing query param", async () => {
		for (const [query, param] of [
			["w=640&q=75", "url"],
			["url=/a.png&q=75", "w"],
			["url=/a.png&w=640", "q"],
		]) {
			const { error } = await handle(`/_vercel/image?${query}`, { images });

			expect(String(error)).toContain(`Add a \`${param}\` query param`);
		}
	});

	test("passes other requests on", async () => {
		expect(await handle("/page", { images })).toMatchObject({
			nextCalled: true,
			error: undefined,
		});
		expect(await handle("/_vercel/image?url=/a.png&w=640&q=75")).toMatchObject({
			nextCalled: true,
			error: undefined,
		});
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

	test("decodes the pathname from the query", () => {
		const req = getRequest(
			new Request("https://app.vercel.app/fn?__pathname=caf%C3%A9/a%20b"),
		);

		expect(req.url).toBe("https://app.vercel.app/caf%C3%A9/a%20b");
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

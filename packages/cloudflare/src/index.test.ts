import { adapter } from "./index.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let dir: string;
let worker: { fetch: (req: Request, ...rest: unknown[]) => Promise<Response> };

beforeAll(async () => {
	dir = await fs.mkdtemp(path.join(os.tmpdir(), "domco-cloudflare-"));
	const appId = path.join(dir, "app.js");
	// reports what the entry passes to `app.fetch`
	await fs.writeFile(
		appId,
		`export default {
			fetch(req, info) {
				return Response.json({ info, env: arguments[2], ctx: arguments[3] });
			},
		};`,
	);

	const { entry } = await adapter();
	const file = path.join(dir, "_worker.js");
	await fs.writeFile(file, entry!({ appId }).code);
	worker = (await import(file)).default;
});

afterAll(() => fs.rm(dir, { recursive: true, force: true }));

describe("cloudflare entry", () => {
	test("passes the IP Cloudflare sets in CF-Connecting-IP", async () => {
		const res = await worker.fetch(
			new Request("https://app.pages.dev/", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
					"X-Forwarded-For": "198.51.100.7",
				},
			}),
			{ BINDING: "env" },
			{ waitUntil: "ctx" },
		);

		expect(await res.json()).toStrictEqual({
			info: { ip: "203.0.113.1" },
			env: { BINDING: "env" },
			ctx: { waitUntil: "ctx" },
		});
	});

	test("does not trust X-Forwarded-For", async () => {
		const res = await worker.fetch(
			new Request("https://app.pages.dev/", {
				headers: { "X-Forwarded-For": "198.51.100.7" },
			}),
		);

		expect(await res.json()).toStrictEqual({ info: {} });
	});
});

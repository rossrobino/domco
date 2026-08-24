import { resolveChunk } from "./index.js";
import { describe, expect, test } from "vitest";

describe("manifest", () => {
	test("resolves page and style entries without enumerating the manifest", () => {
		const page = { file: "page.js" };
		const style = { file: "style.css" };
		const manifest = new Proxy(
			{ "client/docs/+page.html": page, "client/docs/+style.css": style },
			{
				ownKeys() {
					throw new Error("manifest should not be enumerated");
				},
			},
		);

		expect(resolveChunk(manifest, "/docs", "page")).toBe(page);
		expect(resolveChunk(manifest, "/docs", "style")).toBe(style);
	});

	test("resolves script extensions with direct lookups", () => {
		const script = { file: "script.js" };

		expect(
			resolveChunk({ "client/docs/+script.tsx": script }, "/docs", "script"),
		).toBe(script);
		expect(resolveChunk({}, "/missing", "script")).toBeUndefined();
	});
});

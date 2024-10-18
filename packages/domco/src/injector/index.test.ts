import { Injector } from "./index.js";
import { expect, test, describe } from "vitest";

test("init", () => {
	const injector = new Injector();
	expect(injector.toString()).toBeTypeOf("string");
});

test("serializeTags", () => {
	const tags = Injector.serializeTags([
		{ name: "p", attrs: { class: "text-black" }, children: "Paragraph" },
	]);

	expect(tags).toBe(`<p class="text-black">Paragraph</p>`);
});

test("comment", () => {
	expect(
		new Injector(
			`<!doctype html><html><head></head><body><!-- comment --></body></html>`,
		)
			.comment("COMMENT", "Comment")
			.toString(),
	).toBe(`<!doctype html><html><head></head><body>Comment</body></html>`);
});

describe("head", () => {
	const injector = new Injector().head([{ name: "append-head" }]);

	test("append", () => {
		expect(injector.toString()).toBe(
			`<!doctype html><html><head><append-head></append-head></head><body></body></html>`,
		);
	});

	test("prepend", () => {
		expect(
			injector.head([{ name: "prepend-head" }], "prepend").toString(),
		).toBe(
			`<!doctype html><html><head><prepend-head></prepend-head><append-head></append-head></head><body></body></html>`,
		);
	});

	test("create", () => {
		expect(
			new Injector(`<!doctype html><html><body></body></html>`)
				.head([{ name: "create-head" }])
				.toString(),
		).toBe(
			`<!doctype html><html><head><create-head></create-head></head><body></body></html>`,
		);
	});
});

describe("body", () => {
	const injector = new Injector().body([{ name: "append-body" }]);

	test("append", () => {
		expect(injector.toString()).toBe(
			`<!doctype html><html><head></head><body><append-body></append-body></body></html>`,
		);
	});

	test("prepend", () => {
		expect(
			injector.body([{ name: "prepend-body" }], "prepend").toString(),
		).toBe(
			`<!doctype html><html><head></head><body><prepend-body></prepend-body><append-body></append-body></body></html>`,
		);
	});

	test("create", () => {
		expect(
			new Injector(`<!doctype html><html><head></head></html>`)
				.body([{ name: "create-body" }])
				.toString(),
		).toBe(
			`<!doctype html><html><head></head><body><create-body></create-body></body></html>`,
		);
	});
});

describe("title", () => {
	const injector = new Injector().title("create");

	test("create", () => {
		expect(injector.toString()).toBe(
			`<!doctype html><html><head><title>create</title></head><body></body></html>`,
		);
	});

	test("replace", () => {
		injector.title("replace");
		expect(injector.toString()).toBe(
			`<!doctype html><html><head><title>replace</title></head><body></body></html>`,
		);
	});

	test("create head", () => {
		const injector = new Injector(`<!doctype html><html></html>`).title(
			"create head",
		);

		expect(injector.toString()).toBe(
			`<!doctype html><html><head><title>create head</title></head></html>`,
		);
	});
});

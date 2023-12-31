import { getParams, insertParams, trimDynamic } from "./index.js";
import { expect, test } from "bun:test";

test("getParams", async () => {
	expect(
		await getParams(`posts/[postId]/[name]`, `posts/123/hello-world`),
	).toMatchObject({ postId: "123", name: "hello-world" });
});

test("insertParams", async () => {
	expect(
		await insertParams(`posts/[postId]/[name]`, {
			postId: "123",
			name: "hello-world",
		}),
	).toEqual(`posts/123/hello-world`);
});

test("trimDynamic", async () => {
	expect(await trimDynamic(`posts/[postId]/[name]/another`)).toEqual(
		`posts/[postId]`,
	);
});

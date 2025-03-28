/// <reference types="vite/client" />
/// <reference types="domco/env" />
import "hono";
import type { HtmlEscapedString } from "hono/utils/html";

declare module "hono" {
	interface ContextRenderer {
		(
			props: { title: string; tags?: string },
			content: string | Promise<string>,
		): Response | Promise<Response>;
	}
}

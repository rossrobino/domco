/// <reference types="vite/client" />
/// <reference types="domco/env" />
import "hono";
import type { HtmlEscapedString } from "hono/utils/html";

declare module "hono" {
	interface ContextRenderer {
		(
			props: { title: string; client?: HtmlEscapedString[] },
			content: string | Promise<string>,
		): Response | Promise<Response>;
	}
}

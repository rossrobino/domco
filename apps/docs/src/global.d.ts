/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";
import type { HtmlEscapedString } from "hono/utils/html";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
	interface ContextRenderer {
		(
			props: { title: string; client?: HtmlEscapedString[] },
			content: string | Promise<string>,
		): Response | Promise<Response>;
	}
}

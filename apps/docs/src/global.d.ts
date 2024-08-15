/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
	interface ContextRenderer {
		(
			props: { title: string },
			content: string | Promise<string>,
		): Response | Promise<Response>;
	}
}

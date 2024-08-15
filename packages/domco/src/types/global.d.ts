/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "../types/public/index.ts";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
}

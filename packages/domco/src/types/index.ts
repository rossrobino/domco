import { parseHTML } from "linkedom";

export type Build = (
	window: ReturnType<typeof parseHTML>,
	context: BuildContext,
) => Promise<Document>;

export interface BuildContext {
	/** current route */
	route: string;
}

export type Element = (
	window: ReturnType<typeof parseHTML>,
	props?: Record<string, any>,
) => Promise<HTMLElement>;

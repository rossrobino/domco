import { parseHTML } from "linkedom";

export type Build = (
	parseHtmlResult: ReturnType<typeof parseHTML>,
	context: BuildContext,
) => Promise<BuildResult>;

export interface BuildContext {
	/** current route */
	route: string;
}

export interface BuildResult {
	/** the rendered document */
	document: Document;
}

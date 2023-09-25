export type Build = (
	window: Window,
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

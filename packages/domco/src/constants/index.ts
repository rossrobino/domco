export const fileNames = {
	/** page file name with extension */
	page: "+page.html",

	/** server file name without extension */
	server: "+server",

	/** client file name without extension */
	client: "+client",

	/** setup file name without extension */
	setup: "+setup",

	/** output files */
	out: {
		/** names of the output entry points */
		entry: {
			app: "app.js",
		},
	},
} as const;

export const dirNames = {
	/** output directories */
	out: {
		base: "dist",
		client: {
			base: "client",
			/**
			 * Directory for immutable assets. This is useful so
			 * cache headers can be applied correctly via middleware.
			 */
			immutable: "_immutable",
		},
		ssr: "server",
	},
	src: "src",
	public: "public",
} as const;

export const headers = {
	cacheControl: { immutable: "public, immutable, max-age=31536000" },
} as const;

export const setup = "setup";

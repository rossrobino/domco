export const fileNames = {
	/** app file name without extension */
	app: "+app",

	/** page file name with extension */
	page: "+page.html",

	/** script file name without extension */
	script: "+script",

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
	src: { base: "src", client: "client", server: "server" },
	public: "public",
} as const;

export const headers = {
	cacheControl: { immutable: "public, immutable, max-age=31536000" },
} as const;

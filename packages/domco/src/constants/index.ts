export const fileNames = {
	/** Function file name without extension. */
	func: "+func",

	/** Page file name with extension. */
	page: "+page.html",

	/** Script file name without extension. */
	script: "+script",

	/** output files */
	out: {
		/** names of the output entry points */
		entry: {
			func: "func.js",
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

export const ids = {
	/** Function entry point ID. */
	func: `/${dirNames.src.server}/${fileNames.func}`,

	/** Adapter entry ID for the entry point provided by the adapter. */
	adapter: "domco:adapter",
} as const;

declare module "client:page*" {
	/** Transformed HTML page. */
	const html: string;

	export { html };
}

declare module "client:script*" {
	/**
	 * Import the `tags` for a client entry point if you want to add client-side JS without 
	 * adding an HTML page.
	 *
	 * **Development**
	 *
	 * HTML script tag for the client entry point.
	 *
	 * **Production**
	 *
	 * HTML `script` tags for the client script and `link` tags for any imported `.css` files.
	 * domco reads `dist/client/.vite/manifest.json` to find the hashed names after the client
	 * build has completed.
	 */
	const tags: string;

	/**
	 * Import the `src` for a client entry point to get all of the linked resources for the script.
	 * 
	 * **Development**
	 *
	 * `src.module[0]` contains the `src` path of the client entry point.
	 *
	 * **Production**
	 * 
	 * `src` contains arrays of the hashed related paths for the entry point.
	 */
	const src: { 
		/** Add each as the `src` of a `<script type="module">`. */
		module: string[];

		/** Add each as the `href` of a `<link rel="modulepreload" crossorigin>` */
		preload: string[];
		
		/** Add each as the `href` of a `<link rel="stylesheet">` */
		style: string[]
	};
	
	export { tags, src };
}

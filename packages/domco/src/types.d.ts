declare module "client:page*" {
	/** Transformed HTML page. */
	const page: string;

	export default page;
}

declare module "client:tags*" {
	/**
	 * Import the tags for a client entry point if you want to add client-side JS without adding an HTML page.
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

	export default tags;
}

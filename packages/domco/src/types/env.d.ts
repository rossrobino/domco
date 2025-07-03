type Src = {
	/** Source path of the HTML or JS */
	src: string;

	/**
	 * ### Pages
	 *
	 * - **development**: Empty string
	 * - **production**: Final hashed file name of the linked entry JS chunk
	 *
	 * ### Scripts
	 *
	 * - **development**: Source path of the script
	 * - **production**: Final hashed file name
	 */
	file: string;

	/** Add each as the `src` of a `<script type="module">` */
	module: string[];

	/** Add each as the `href` of a `<link rel="modulepreload" crossorigin>` */
	preload: string[];

	/** Add each as the `href` of a `<link rel="stylesheet">` */
	style: string[];

	/** Any assets (ex: fonts) that are used within the entry or its imports */
	assets: string[];

	/** Nested dynamically imported module information */
	dynamic: { tags: string; src: Src }[];
};

declare module "client:page*" {
	export type Chunk = { tags: string; src: Src };

	/** Transformed HTML page */
	export const html: string;

	/**
	 * Each entry HTML page has a `ManifestChunk` created in the Vite manifest
	 * that holds information about the resources required on the page.
	 *
	 * This `chunk` is a flattened `ManifestChunk` that contains `tags` and the `src`
	 * resources for the entry _and_ all of its imports. This is useful if you want to add
	 * [preload links for fonts](https://web.dev/articles/codelab-preload-web-fonts#preloading_web_fonts)
	 * for example, you can use `chunk.src.assets` to find the assets to preload.
	 *
	 * `tags` are already included in the HTML `<head>`.
	 */
	export const chunk: Chunk;
}

declare module "client:script*" {
	export type Chunk = { tags: string; src: Src };

	/**
	 * Import the `tags` for a client entry point if you want to add
	 * client-side JS without adding an HTML page.
	 *
	 * **Development**
	 *
	 * HTML script tag for the client entry point.
	 *
	 * **Production**
	 *
	 * HTML `script` tags for the client script and `link` tags for any
	 * imported `.css` files. domco reads `dist/client/.vite/manifest.json`
	 * to find the hashed names after the client build has completed.
	 */
	export const tags: string;

	/**
	 * Import the `src` for a client entry point to get all of the linked
	 * resources for the script.
	 *
	 * **Development**
	 *
	 * `src.file` contains the path of the client entry point.
	 *
	 * **Production**
	 *
	 * `src` contains arrays of the hashed related paths for the entry point.
	 */
	export const src: Src;
}

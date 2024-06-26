import {
	minify,
	type Options as MinifyHtmlOptions,
} from "html-minifier-terser";

const minifyHtml = async (html: string, options: MinifyHtmlOptions = {}) => {
	// update plugin options in `plugin/index.ts` when default options change
	const mergedOptions: MinifyHtmlOptions = {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		html5: true,
		minifyCSS: true,
		minifyJS: true,
		quoteCharacter: '"',
		removeComments: true,
		removeEmptyAttributes: true,
		removeAttributeQuotes: true,
		sortAttributes: true,
		sortClassName: true,
		useShortDoctype: true,
	};

	Object.assign(mergedOptions, options);

	return await minify(html, mergedOptions);
};

export { type MinifyHtmlOptions, minifyHtml };

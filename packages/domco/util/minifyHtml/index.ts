import {
	minify,
	type Options as MinifyHtmlOptions,
} from "html-minifier-terser";

const minifyHtml = async (html: string, options: MinifyHtmlOptions = {}) => {
	const mergedOptions: MinifyHtmlOptions = {
		removeComments: true,
		collapseBooleanAttributes: true,
		removeEmptyAttributes: true,
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: true,
		useShortDoctype: true,
		html5: true,
		quoteCharacter: '"',
		removeAttributeQuotes: true,
	};

	Object.assign(mergedOptions, options);

	return await minify(html, mergedOptions);
};

export { type MinifyHtmlOptions, minifyHtml };

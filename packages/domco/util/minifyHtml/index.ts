import { minify } from "html-minifier-terser";

export const minifyHtml = async (html: string) => {
	return await minify(html, {
		removeComments: true,
		collapseBooleanAttributes: true,
		removeEmptyAttributes: true,
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: true,
		useShortDoctype: true,
		html5: true,
		quoteCharacter: '"',
	});
};

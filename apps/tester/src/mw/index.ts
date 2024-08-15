import {
	Injector,
	type CommentDescriptor,
	type TagDescriptor,
} from "domco/injector";
import { createMiddleware } from "hono/factory";

/**
 * Hono middleware to inject tags into an HTML page.
 *
 * First looks for `options.html`, then uses `c.var.page()`.
 *
 * @param options Inject options.
 * @returns Inject Hono middleware.
 */
export const inject = (options: {
	/**
	 * Set or replace the contents of the `title` tag.
	 */
	title?: string;

	/**
	 * Inject tags into the head.
	 */
	head?: TagDescriptor[];

	headPrepend?: TagDescriptor[];

	/**
	 * Inject tags into the body.
	 */
	body?: TagDescriptor[];

	bodyPrepend?: TagDescriptor[];

	/**
	 * Replace comments with tags.
	 *
	 * Set `tag` equal to text within comment.
	 */
	comment?: CommentDescriptor[];

	/**
	 * @default c.var.page
	 */
	html?: string;

	/**
	 * Should return the final HTML as the response.
	 *
	 * @default false
	 */
	handler?: boolean;
}) => {
	return createMiddleware(async (c, next) => {
		const {
			title,
			head,
			headPrepend,
			body,
			bodyPrepend,
			comment,
			html,
			handler,
		} = options;

		const newPage = new Injector(html ?? c.var.page())
			.title(title)
			.head(head)
			.head(headPrepend, true)
			.body(body)
			.body(bodyPrepend, true)
			.comment(comment)
			.toString();

		if (handler) {
			return c.html(newPage);
		}

		c.set("page", () => newPage);

		await next();
	});
};

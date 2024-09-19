export type TagDescriptor = {
	tag: string;
	attrs?: Record<string, string | boolean | undefined>;
	children?: string | TagDescriptor[];
};

export type CommentDescriptor = {
	text: string;
	children?: string | TagDescriptor[];
};

const serializeAttrs = (attrs: TagDescriptor["attrs"]) => {
	let res = "";
	for (const key in attrs) {
		if (typeof attrs[key] === "boolean") {
			res += attrs[key] ? ` ${key}` : ``;
		} else {
			res += ` ${key}=${JSON.stringify(attrs[key])}`;
		}
	}
	return res;
};

const unaryTags = new Set(["link", "meta", "base"]);

export const serializeTag = ({ tag, attrs, children }: TagDescriptor) => {
	if (unaryTags.has(tag)) {
		return `<${tag}${serializeAttrs(attrs)}>`;
	} else {
		return `<${tag}${serializeAttrs(attrs)}>${serializeTags(
			children,
		)}</${tag}>`;
	}
};

export const serializeTags = (tags: TagDescriptor["children"]): string => {
	if (typeof tags === "string") {
		return tags;
	} else if (tags && tags.length) {
		return tags.map((tag) => serializeTag(tag)).join("");
	}
	return "";
};

/**
 * Inject tags into an HTML string.
 *
 * Much of this code is [copied from Vite](https://github.com/vitejs/vite/blob/fcf50c2e881356ea0d725cc563722712a2bf5695/packages/vite/src/node/plugins/html.ts)
 * and modified into a class.
 */
export class Injector {
	#headInjectRE = /<\/head>/i;
	#headPrependInjectRE = /<head[^>]*>/i;
	#htmlInjectRE = /<\/html>/i;
	#htmlPrependInjectRE = /<html[^>]*>/i;
	#bodyInjectRE = /<\/body>/i;
	#bodyPrependInjectRE = /<body[^>]*>/i;
	#doctypePrependInjectRE = /<!doctype html>/i;
	#titleRE = /<title>(.*?)<\/title>/;

	html: string;

	constructor(html?: string) {
		this.html =
			html ?? "<!doctype html><html><head></head><body></body></html>";
	}

	toString() {
		return this.html;
	}

	#prependInjectFallback(html: string, tags: TagDescriptor[]) {
		// prepend to the html tag, append after doctype, or the document start
		if (this.#htmlPrependInjectRE.test(html)) {
			return html.replace(
				this.#htmlPrependInjectRE,
				`$&${serializeTags(tags)}`,
			);
		}

		if (this.#doctypePrependInjectRE.test(html)) {
			return html.replace(
				this.#doctypePrependInjectRE,
				`$&${serializeTags(tags)}`,
			);
		}

		return serializeTags(tags) + html;
	}

	/**
	 * Replace comments with tags.
	 *
	 * Set `text` equal to text within comment.
	 *
	 * @param tags Comments to replace.
	 */
	comment(tags?: CommentDescriptor[]) {
		if (tags && tags.length) {
			for (const tag of tags) {
				this.html = this.html.replace(
					new RegExp(`<!--\\s*${tag.text}\\s*-->`, "g"),
					serializeTags(tag.children),
				);
			}
		}

		return new Injector(this.html);
	}

	/**
	 * @param text Text to set or change the title to.
	 */
	title(text?: string) {
		if (!text) return new Injector(this.html);

		if (this.#titleRE.test(this.html)) {
			return new Injector(
				this.html.replace(this.#titleRE, `<title>${text}</title>`),
			);
		}

		return this.head([{ tag: "title", children: text }]);
	}

	/**
	 * Inject tags into the `head` element.
	 *
	 * @param tags Tags to inject.
	 * @param prepend Add tags at the beginning. - defaults to `false`
	 */
	head(tags?: TagDescriptor[], prepend = false) {
		if (!tags || tags.length === 0) return new Injector(this.html);

		if (prepend) {
			// inject as the first element of head
			if (this.#headPrependInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#headPrependInjectRE, serializeTags(tags)),
				);
			}
		} else {
			// inject before head close
			if (this.#headInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#headInjectRE, serializeTags(tags)),
				);
			}

			// try to inject before the body tag
			if (this.#bodyPrependInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#bodyPrependInjectRE, serializeTags(tags)),
				);
			}
		}
		// if no head tag is present, we prepend the tag for both prepend and append
		return new Injector(this.#prependInjectFallback(this.html, tags));
	}

	/**
	 * Inject tags into the `body` element.
	 *
	 * @param tags Tags to inject.
	 * @param prepend Add tags at the beginning. - defaults to `false`
	 */
	body(tags?: TagDescriptor[], prepend = false) {
		if (!tags || tags.length === 0) return new Injector(this.html);

		if (prepend) {
			// inject after body open
			if (this.#bodyPrependInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#bodyPrependInjectRE, serializeTags(tags)),
				);
			}

			// if no there is no body tag, inject after head or fallback to prepend in html
			if (this.#headInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#headInjectRE, serializeTags(tags)),
				);
			}
			return new Injector(this.#prependInjectFallback(this.html, tags));
		} else {
			// inject before body close
			if (this.#bodyInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#bodyInjectRE, serializeTags(tags)),
				);
			}

			// if no body tag is present, append to the html tag, or at the end of the file
			if (this.#htmlInjectRE.test(this.html)) {
				return new Injector(
					this.html.replace(this.#htmlInjectRE, `${serializeTags(tags)}$&`),
				);
			}

			return new Injector(this.html + serializeTags(tags));
		}
	}
}

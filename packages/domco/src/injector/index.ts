// Vite reference - https://github.com/vitejs/vite/blob/fcf50c2e881356ea0d725cc563722712a2bf5695/packages/vite/src/node/plugins/html.ts
import type { TagInput, TagDescriptor, InjectMethod } from "../types/index.js";

/**
 * Inject tags into an HTML string.
 *
 * ```ts
 * import { Injector } from "domco/injector";
 *
 * const injector = new Injector(
 * 	`<!doctype html><html><body><!-- comment --></body></html>`,
 * );
 *
 * injector
 * 	// Set or change the title
 * 	.title("My Title")
 * 	// pass a TagDescriptor
 * 	.head([{ name: "script", attrs: { type: "module", src: "./script.js" } }])
 * 	// pass a string of text
 * 	.body("Prepended to the body! ", "prepend")
 * 	// replace comments
 * 	.comment("comment", "My comment")
 * 	// stringify HTML
 * 	.toString();
 * ```
 *
 * Produces the following HTML.
 *
 * ```html
 * <!doctype html><html><head><title>My Title</title><script type="module" src="./script.js"></script></head><body>Prepended to the body! My comment</body></html>
 * ```
 */
export class Injector {
	#html: string;

	/**
	 * @param html The HTML string.
	 *
	 * @default
	 *
	 * ```html
	 * <!doctype html><html><head></head><body></body></html>
	 * ```
	 */
	constructor(html?: string) {
		this.#html =
			html ?? "<!doctype html><html><head></head><body></body></html>";
	}

	/** @returns The HTML. */
	toString() {
		return this.#html;
	}

	/** Serializes HTML attribute objects into a string. */
	static #serializeAttrs(attrs: TagDescriptor["attrs"]) {
		let str = "";

		for (const key in attrs) {
			if (
				// if `false` don't add
				attrs[key] &&
				typeof attrs[key] === "boolean"
			) {
				str += ` ${key}`;
			} else {
				str += ` ${key}=${JSON.stringify(attrs[key])}`;
			}
		}

		return str;
	}

	/** Serializes a TagDescriptor into a string. */
	static #serializeTag({ name, attrs, children }: TagDescriptor) {
		if (["link", "meta", "base"].includes(name)) {
			return `<${name}${this.#serializeAttrs(attrs)}>`;
		}

		return `<${name}${this.#serializeAttrs(attrs)}>${this.serializeTags(
			children,
		)}</${name}>`;
	}

	/** Serializes an array of TagDescriptors into a string. */
	static serializeTags(tags: TagDescriptor["children"]): string {
		if (tags instanceof Array) {
			return tags.map((tag) => this.#serializeTag(tag)).join("");
		} else if (typeof tags === "string") {
			return tags;
		} else if (tags) {
			return this.#serializeTag(tags);
		}

		return "";
	}

	/**
	 * Inject tags into the HTML string.
	 *
	 * @param target Name of the tag that is being targeted.
	 * @param tags Tags to inject into the target.
	 * @param method Add tags at the end, beginning, or replace. - defaults to `"append"`
	 * @returns The Injector instance.
	 */
	#inject(target: string, tags: TagInput, method: InjectMethod = "append") {
		let regex: RegExp;

		if (method === "append") {
			regex = new RegExp(`<\/${target}>`, "i");
		} else if (method === "prepend") {
			regex = new RegExp(`<${target}[^>]*>`, "i");
		} else {
			// "replace"
			regex = new RegExp(`<${target}>(.*?)<\/${target}>`, "i");
		}

		if (regex.test(this.#html)) {
			// found
			this.#html = this.#html.replace(regex, (m) => {
				if (method === "append") {
					return `${Injector.serializeTags(tags)}${m}`;
				} else if (method === "prepend") {
					return `${m}${Injector.serializeTags(tags)}`;
				} else {
					// "replace"
					return `<${target}>${Injector.serializeTags(tags)}</${target}>`;
				}
			});

			return this;
		}

		throw new Error(`${target} not found.`);
	}

	/**
	 * Replace comments with tags.
	 *
	 * @param text Text within comment.
	 * @param tags Tags to replace the comment with.
	 * @returns The Injector instance.
	 */
	comment(text: string, tags: TagInput) {
		this.#html = this.#html.replace(
			new RegExp(`<!--\\s*${text}\\s*-->`, "gi"),
			Injector.serializeTags(tags),
		);

		return this;
	}

	/**
	 * Set or change the document's title element.
	 *
	 * @param text Text to set or change the `title` to.
	 * @returns The Injector instance.
	 */
	title(text: string) {
		try {
			return this.#inject("title", text, "replace");
		} catch {
			return this.head({ name: "title", children: text });
		}
	}

	/**
	 * Inject tags into the `head` element.
	 *
	 * @param tags Tags to inject.
	 * @param method Add tags at the end, beginning, or replace. - defaults to `"append"`
	 * @returns The Injector instance.
	 */
	head(tags: TagInput, method: InjectMethod = "append") {
		try {
			// try to inject into head
			return this.#inject("head", tags, method);
		} catch {
			try {
				// try to prepend a new head element to html
				return this.#inject(
					"html",
					{ name: "head", children: tags },
					"prepend",
				);
			} catch {
				this.#html += Injector.serializeTags(tags);
				return this;
			}
		}
	}

	/**
	 * Inject tags into the `body` element.
	 *
	 * @param tags Tags to inject.
	 * @param method Add tags at the end, beginning, or replace. - defaults to `"append"`
	 * @returns The Injector instance.
	 */
	body(tags: TagInput, method: InjectMethod = "append") {
		try {
			return this.#inject("body", tags, method);
		} catch {
			try {
				// append a new body element to html
				return this.#inject("html", { name: "body", children: tags });
			} catch {
				this.#html += Injector.serializeTags(tags);
				return this;
			}
		}
	}

	/**
	 * Inject tags into the `main` element, appends `main` + tags to `body` if not found.
	 *
	 * @param tags Tags to inject.
	 * @param method Add tags at the end, beginning, or replace. - defaults to `"append"`
	 * @returns The Injector instance.
	 */
	main(tags: TagInput, method: InjectMethod = "append") {
		try {
			return this.#inject("main", tags, method);
		} catch {
			return this.body({ name: "main", children: tags }, "append");
		}
	}
}

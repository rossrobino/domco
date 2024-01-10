const defaultSelector = "a[href^='/']";
const defaultEvent = "hover";
const speculationrules = "speculationrules";

/* the current urls that have been prefetched already */
const prefetchedUrls: string[] = [];

/**
 * Use on the client to prefetch/prerender the content for link tags
 * on the current page.
 *
 * Can also be used more than once with different options for different selectors.
 *
 * @example
 *
 * ```js
 * import { prefetch } from "domco";
 *
 * prefetch({ prerender: true });
 * ```
 *
 * @param options prefetch options
 */
export const prefetch = (
	options: {
		/**
		 * css selector for the anchor elements,
		 * defaults to elements that start with "/" `"a[href^='/']"`.
		 *
		 * For example, set to `"a[href^='/posts']"` to apply only
		 * to routes that begin with "/posts", or use another attribute entirely.
		 *
		 * If you are selecting another element instead of an `a` tag, be sure the element
		 * has a `href` property.
		 */
		selector?: string;
		/**
		 * Uses the experimental Speculation Rules API when supported
		 * to prerender on the client, defaults to `false`.
		 *
		 * Browsers that do not support will still use `<link rel="prefetch">` instead.
		 *
		 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)
		 */
		prerender?: boolean;
		/**
		 * Determines when the prefetch takes place, defaults to `"hover"`.
		 *
		 * - `"hover"` - after `mouseover` or `focus` for > 200ms, and on `touchstart` for mobile
		 * - `"visible"` - within viewport
		 * - `"load"` - when script is loaded, use carefully
		 */
		event?: "hover" | "load" | "visible";
	} = { selector: defaultSelector, prerender: false, event: defaultEvent },
	// above is the default if undefined
) => {
	// defaults if partially defined
	const {
		selector = defaultSelector,
		prerender = false,
		event = defaultEvent,
	} = options;

	const anchors = document.querySelectorAll<HTMLAnchorElement>(selector);

	const appendTag = (href: string) => {
		if (!(href === window.location.href)) {
			const url = new URL(href).pathname;
			if (!prefetchedUrls.includes(url)) {
				// if it's not already there
				prefetchedUrls.push(url);
				if (
					prerender &&
					HTMLScriptElement.supports &&
					HTMLScriptElement.supports(speculationrules)
				) {
					const specScript = document.createElement("script");
					specScript.type = speculationrules;
					specScript.textContent = JSON.stringify({
						prerender: [
							{
								source: "list",
								urls: [url],
							},
						],
					});
					document.head.append(specScript);
				} else {
					// prerender off/not supported, and it isn't already there
					const link = document.createElement("link");
					link.rel = "prefetch";
					link.as = "document";
					link.href = url;
					document.head.append(link);
				}
			}
		}
	};

	let prefetchTimer: NodeJS.Timeout;

	/**
	 * @param delay ms delay - for `hover`
	 * @returns the event listener with delay
	 */
	const listener =
		(delay = 200) =>
		(e: Event) => {
			const { href } = e.currentTarget as HTMLAnchorElement;
			prefetchTimer = setTimeout(() => appendTag(href), delay);
		};

	const reset = () => clearTimeout(prefetchTimer);

	const observer = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (e.isIntersecting) {
				appendTag((e.target as HTMLAnchorElement).href);
			}
		}
	});

	for (const anchor of anchors) {
		if (event === "hover") {
			anchor.addEventListener("mouseover", listener());
			anchor.addEventListener("mouseout", reset);
			anchor.addEventListener("focus", listener());
			anchor.addEventListener("focusout", reset);
			anchor.addEventListener("touchstart", listener(0));
		} else if (event === "visible") {
			observer.observe(anchor);
		} else {
			// load
			appendTag(anchor.href);
		}
	}
};

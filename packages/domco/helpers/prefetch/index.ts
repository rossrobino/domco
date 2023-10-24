interface SpecRules {
	prerender?: {
		source: string;
		urls: string[];
	}[];
}

const sel = "a[href^='/']";
const hover = "hover";
const speculationrules = "speculationrules";

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
		 * - `"hover"` - after mouseover or focus for > 200ms
		 * - `"visible"` - within viewport
		 * - `"load"` - when script is loaded, use carefully
		 */
		event?: "hover" | "load" | "visible";
	} = { selector: sel, prerender: false, event: hover },
) => {
	const { selector = sel, prerender = false, event = hover } = options;

	const anchors = document.querySelectorAll<HTMLAnchorElement>(selector);

	let prefetchTimer: NodeJS.Timeout;

	const listener = (e: Event) => {
		const { href } = e.currentTarget as HTMLAnchorElement;
		const isCurrent = href === window.location.href;
		if (!isCurrent) {
			prefetchTimer = setTimeout(() => {
				const pathname = new URL(href).pathname;
				if (
					prerender &&
					HTMLScriptElement.supports &&
					HTMLScriptElement.supports(speculationrules)
				) {
					let isNew = true;
					// check if it's already there
					const existing = document.querySelectorAll<HTMLScriptElement>(
						`script[type='${speculationrules}']`,
					);
					for (const s of existing) {
						const rules = JSON.parse(s.textContent || "{}") as SpecRules;
						if (rules.prerender?.at(0)?.urls.includes(pathname)) {
							isNew = false;
							break;
						}
					}
					if (isNew) {
						const specScript = document.createElement("script");
						specScript.type = speculationrules;
						const specRules = {
							prerender: [
								{
									source: "list",
									urls: [pathname],
								},
							],
						};
						specScript.textContent = JSON.stringify(specRules);
						document.head.appendChild(specScript);
					}
				} else if (
					document.querySelector(`link[href='${pathname}']`) === null
				) {
					// prerender off/not supported, and it isn't already there
					const link = document.createElement("link");
					link.rel = "prefetch";
					link.as = "document";
					link.href = pathname;
					document.head.appendChild(link);
				}
			}, 200);
		}
	};

	const reset = () => clearTimeout(prefetchTimer);

	const observer = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (e.isIntersecting) {
				listener({ currentTarget: e.target } as any);
			}
		}
	});

	for (const anchor of anchors) {
		if (event === hover) {
			anchor.addEventListener("mouseover", listener);
			anchor.addEventListener("focus", listener);
			anchor.addEventListener("mouseout", reset);
			anchor.addEventListener("focusout", reset);
		} else if (event === "visible") {
			observer.observe(anchor);
		} else {
			// load
			listener({ currentTarget: anchor } as any);
		}
	}
};

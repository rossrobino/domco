import "drab/share/define";
import "drab/prefetch/define";
import "drab/details/define";

import { inject } from "@vercel/analytics";

// https://developer.chrome.com/docs/web-platform/prerender-pages#impact_on_analytics
const whenActivated = new Promise<void>((resolve) => {
	// @ts-ignore - not supported in all browsers
	if (document.prerendering) {
		// @ts-ignore - not supported in all browsers
		document.addEventListener("prerenderingchange", resolve);
	} else {
		resolve();
	}
});

const initAnalytics = async () => {
	await whenActivated;
	inject({ mode: import.meta.env.DEV ? "development" : "production" });
};

initAnalytics();

const pres = document.querySelectorAll("pre, .copy-text");

pres.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

import { prefetch } from "domco";
import { ShareUrl } from "$lib/elements/ShareUrl";

prefetch({ prerender: true });

customElements.define("share-url", ShareUrl);

const pres = document.querySelectorAll("pre, .copy-text");

pres.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

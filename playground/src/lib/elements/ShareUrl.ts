export class ShareUrl extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const event = this.getAttribute("event") || "click";

		const url = this.getAttribute("url") || window.location.href;
		const shareData: ShareData = { url };

		const selector = this.getAttribute("selector");
		const elements = selector ? this.querySelectorAll(selector) : this.children;

		for (const el of elements) {
			el.addEventListener(event, async () => {
				const originalText = el.textContent;
				if (navigator.canShare && navigator.canShare(shareData)) {
					try {
						await navigator.share(shareData);
					} catch (error: any) {
						if (error.name !== "AbortError") {
							console.error(error);
						}
					}
				} else {
					// progressively enhance, copy the link
					try {
						await navigator.clipboard.writeText(url);
						el.textContent = "Copied";
						setTimeout(() => (el.textContent = originalText), 800);
					} catch (error) {
						console.error(error);
					}
				}
			});
		}
	}
}

import { Block } from "domco";

export const shareButton: Block = async ({ customElements, HTMLElement }) => {
	customElements.define(
		"share-button",
		class extends HTMLElement {
			constructor() {
				super();
			}

			connectedCallback() {
				const textContent = this.textContent;
				this.setAttribute("role", "button");

				const url = this.getAttribute("url") || "";

				const shareData: ShareData = { url };

				this.addEventListener("click", async () => {
					if (navigator.canShare && navigator.canShare(shareData)) {
						try {
							await navigator.share(shareData);
						} catch (error: any) {
							if (error.name !== "AbortError") {
								console.error(error);
							}
						}
					} else if (shareData.url) {
						// progressively enhance, copy the link
						try {
							await navigator.clipboard.writeText(shareData.url);
							this.textContent = "Copied";
							setTimeout(() => (this.textContent = textContent), 800);
						} catch (error) {
							console.error(error);
						}
					}
				});
			}
		},
	);
};

const anchors = document.querySelectorAll("a[href^='/']");

for (const anchor of anchors) {
	let prefetchTimer: NodeJS.Timeout;

	const listener = (e: Event) => {
		if (e.target instanceof HTMLAnchorElement) {
			const href = e.target.href;
			const isCurrent = href === window.location.href;
			const isNew = document.querySelector(`link[href='${href}']`) === null;
			if (isNew && !isCurrent) {
				prefetchTimer = setTimeout(() => {
					const link = document.createElement("link");
					link.rel = "prefetch";
					link.href = href;
					document.head.appendChild(link);
				}, 200);
			}
		}
	};

	const reset = () => clearTimeout(prefetchTimer);

	anchor.addEventListener("mouseover", listener);
	anchor.addEventListener("focus", listener);
	anchor.addEventListener("mouseout", reset);
	anchor.addEventListener("focusout", reset);
}

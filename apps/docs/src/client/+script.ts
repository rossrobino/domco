import "@/client/tailwind.css";
import "drab/dialog/define";
import "drab/prefetch/define";

const toCopy = document.querySelectorAll("pre, .copy-text");
toCopy.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

document.querySelectorAll("a").forEach((link) => {
	if (link.pathname === window.location.pathname) {
		link.dataset.current = "";
	}
});

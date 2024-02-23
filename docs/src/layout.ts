import "drab/share/define";
import "drab/prefetch/define";

const pres = document.querySelectorAll("pre, .copy-text");

pres.forEach((pre) => {
	pre.addEventListener("click", async () => {
		if (pre.textContent) await navigator.clipboard.writeText(pre.textContent);
	});
});

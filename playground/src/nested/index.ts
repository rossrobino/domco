import { chunk } from "$lib/util/chunk";

console.log(chunk);

const pre = document.querySelector("#prerender");
// @ts-expect-error
pre.textContent = "Prerendering? " + document.prerendering;

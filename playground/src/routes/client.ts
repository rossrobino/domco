// nothing special about this file/name, gets processed by vite since it's imported in an html file

import { CustomElement } from "$lib/components/CustomElement";
import { chunk } from "$lib/util/chunk";

console.log(chunk);

// custom element //
await CustomElement(window);

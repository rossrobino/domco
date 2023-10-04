// nothing special about this file/name, gets processed by vite since it's imported in an html file

import { userButton } from "$lib/blocks/userButton";
import { chunk } from "$lib/util/chunk";
import { addBlocks } from "domco";

console.log(chunk);

// custom element hydrated on the client //
await addBlocks(window, [userButton]);

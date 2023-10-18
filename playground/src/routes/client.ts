// nothing special about this file/name, gets processed by vite since it's imported in an html file

import { ShareUrl } from "$lib/elements/ShareUrl";
import { userButton } from "$lib/blocks/userElement";
import { addBlocks } from "domco";

customElements.define("share-url", ShareUrl);

await addBlocks(window, [userButton]);

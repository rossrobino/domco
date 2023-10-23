import { prefetch } from "domco";
import { ShareUrl } from "$lib/elements/ShareUrl";

prefetch({ prerender: true });

customElements.define("share-url", ShareUrl);

// @ts-ignore - no type for SSR
import App from "./App.svelte";
import "@/style.css";

const app = new App({
	target: document.getElementById("root")!,
	hydrate: true,
});

export default app;

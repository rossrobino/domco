import App from "./App";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
	document.getElementById("root")!,
	<StrictMode>
		<App />
	</StrictMode>,
);

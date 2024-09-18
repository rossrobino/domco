import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.hydrateRoot(
	document.getElementById("root")!,
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

# Migrate

This section will show you how to server-side render an existing Vite/React single page application with domco. It will use the React template created when running `npm create vite`.

You could also import the `html` and serve your single-page application without server-rendering as well.

## Install

Run the following command in your terminal to install domco as a dependency.

```bash
npm i -D domco
```

## Setup

Add `domco` to your `plugins` array in your `vite.config`.

<!-- // prettier-ignore -->

```ts {3,9}
// vite.config.ts
import react from "@vitejs/plugin-react";
import { domco } from "domco";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		domco(), // add to plugins
		react(),
	],
});
```

## Update types

Add types to `/src/vite.env.d.ts`.

```ts {3}
// /src/vite.env.d.ts
/// <reference types="vite/client" />
/// <reference types="domco/env" />
```

## Create `app` directory

- Create a new `src/app/` directory to house the shared code that will run on the server and the client.
- Move `App.tsx` into `src/app/`.

## Create `client` directory

- Create a new `src/client/` directory to contain client side code.
- Move `index.html`, `src/App.css`, `src/index.css`, and `src/main.tsx` into `src/client/`.
- Be sure to update any import statements to the correct path if TS doesn't for you.
- Update `src/client/main.tsx` to use React's `hydrateRoot` function since the server rendered HTML will now already exist when this script is run. We will "hydrate" it instead of rendering it again from scratch.

```tsx
// src/client/main.tsx
import App from "../app/App.tsx";
import "./index.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
	document.getElementById("root")!,
	<StrictMode>
		<App />
	</StrictMode>,
);
```

### Update HTML

- Rename `index.html` to `+page.html`.
- Change the `src` attribute of the `script` tag in `+page.html` linking to `"/src/main.tsx"` to `"/client/main.tsx"`.
- Add the text `%root%` inside the `root` `div` to replace on the server.

```html {10,11}
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" type="image/svg+xml" href="/vite.svg" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Vite + React + TS</title>
	</head>
	<body>
		<div id="root">%root%</div>
		<script type="module" src="/client/main.tsx"></script>
	</body>
</html>
```

## Add a server entry point

Create a server entry `src/server/+app.tsx` file.

```tsx
// /src/server/+app.tsx
// import your App
import App from "../app/App";
// import the HTML page
import { html } from "client:page";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";

export const handler = async (_req: Request) => {
	return new Response(
		html.replace(
			"%root%", // replace the text "%root%" with the React App
			renderToString(
				<StrictMode>
					<App />
				</StrictMode>,
			),
		),
		{
			headers: { "Content-Type": "text/html" },
		},
	);
};
```

`handler` is now an API route serving your React SSR application!

## Directory tree reference

```txt
src/
├── app/
│   └── App.tsx
├── assets/
│   └── react.svg
├── client/
│   ├── +page.html
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── server/
│   └── +app.tsx
└── vite-env.d.ts
```

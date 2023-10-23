# domco

[Documentation](https://domco.robino.dev/docs/learn)

## Features

**domco** is a [Vite](https://vitejs.dev) plugin that adds the following functionality.

-   [MPA configuration](https://domco.robino.dev/docs/learn#html)
-   [HTML layouts](https://domco.robino.dev/docs/learn#layout)
-   [Build time rendering](https://domco.robino.dev/docs/learn#build) using browser APIs
-   [Static site generation](https://domco.robino.dev/docs/learn#dynamic-routes) with generated routes
-   [Prefetching](https://domco.robino.dev/docs/modules#prefetch)
-   [HTML minification](https://domco.robino.dev/docs/learn#html-minification)

**domco** is under development and has not reached version 1.0, please file any issues [on GitHub](https://github.com/rossrobino/domco/issues).

## Overview

In contrast to other static site generators, which often require familiarization with various template file types, **domco** presents an refreshing solution. It enables you to utilize familiar browser APIs on the server at build time, and work undeterred by the shifts in the landscape of server side JavaScript tooling.

Take for instance, fetching data from a CMS and having it rendered on a page. Your website already handles this task smoothly in the browser.

```js
// client side JavaScript
const res = await fetch("https://my-cms...");
const data = await res.json();
const article = document.querySelector("article");
article.innerHtml = data.html;
```

Now, what if you could take this same code, and run it to update the HTML at _build_ time? **domco** enables you to do exactly that without having to rely on a UI library to take care of the rendering on the server.

```ts
// src/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
	const res = await fetch("https://my-cms...");
	const data = await res.json();
	const article = document.querySelector("article");
	article.innerHtml = data.html;
};
```

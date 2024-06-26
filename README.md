## Features

**domco** is a [Vite](https://vitejs.dev) plugin that adds the following functionality.

-   [MPA configuration](https://domco.robino.dev/docs/learn/#html)
-   [HTML layouts](https://domco.robino.dev/docs/learn/#layout)
-   [Static Site Generation](https://domco.robino.dev/docs/learn/#build) using browser APIs
-   [Dynamic routes](https://domco.robino.dev/docs/learn/#dynamic-routes)
-   [HTML minification](https://domco.robino.dev/docs/learn/#html-minification)

**domco** is under development and has not reached version 1.0, please file any issues on [GitHub](https://github.com/rossrobino/domco/issues).

## Overview

In contrast to other static site generators, which often require familiarization with various template file types, **domco** presents a refreshing solution. It enables you to utilize HTML, CSS, and JavaScript, and work undeterred by the shifts in the landscape of server side JavaScript tooling.

One key feature **domco** provides is the use of browser APIs on the server through the usage of [jsdom](https://github.com/jsdom/jsdom).

Take for instance, fetching data from a CMS and having it rendered on a page. Your website already handles this task smoothly in the browser.

```js
// client side JavaScript
const res = await fetch("https://my-cms...");
const data = await res.json();
const article = document.querySelector("article");
article.innerHtml = data.html;
```

Now, what if you could take this same code, and run it at _build_ time? Move this to a server context, you usually run into [`ReferenceError: document is not defined`](https://www.google.com/search?q=document+is+not+defined).

Most frameworks require you to learn a new strategy for rendering on the server, for example using JSX, or a markdown file with front-matter variables.

```jsx
// ReactServerComponent.jsx
const ServerComponent = async () => {
	const res = await fetch("https://my-cms...");
	const data = await res.json();
	return <article>{data.html}</article>;
};

export default ServerComponent;
```

These strategies work well, but also create another abstraction on top of what you already know. They also have some limitations, for example, what if you want to modify the result of some markdown after it gets processed into HTML? It quickly becomes difficult without something like `document.querySelector`.

> _"JavaScript is great at manipulating the DOM."_ --- [The Primeagen](https://youtu.be/UdCXUVhVSEE?t=3202)

With **domco** you do not need learn a new API, UI framework, or even language to update HTML at build time. You can just make updates to the HTML using familiar browser APIs within a build function, ensuring less JavaScript get shipped to each user.

```ts
// src/+config.ts
import type { Config } from "domco";

export const config: Config = {
	build: async ({ document }) => {
		const res = await fetch("https://my-cms...");
		const data = await res.json();
		const article = document.querySelector("article");
		article.innerHtml = data.html;
	},
};
```

**domco** aims to provide many of the features and developer experience of modern frameworks without having to learn a new language.

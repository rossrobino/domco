## Features

**domco** is a [Vite](https://vitejs.dev) plugin that adds the following functionality.

- [MPA configuration](/docs/learn#html)
- [HTML layouts](/docs/learn#layout)
- [Build time rendering](/docs/learn#build) using browser APIs
- [Static site generation](/docs/learn#dynamic-routes) with generated routes
- [Prefetching](/docs/modules#prefetch)
- [HTML minification](/docs/learn#html-minification)

**domco** is under development and has not reached version 1.0, please file any issues [on GitHub](https://github.com/rossrobino/domco/issues).

## Overview

In contrast to other static site generators, which often require familiarization with various template file types, **domco** presents an refreshing solution. It enables you to utilize HTML, CSS, and JavaScript, and work undeterred by the shifts in the landscape of server side JavaScript tooling.

One key feature **domco** provides is the use of browser APIs on the server through the usage of [LinkeDOM](https://github.com/WebReflection/linkedom).

Take for instance, fetching data from a CMS and having it rendered on a page. Your website already handles this task smoothly in the browser.

```js
// client side JavaScript
const res = await fetch("https://my-cms...");
const data = await res.json();
const article = document.querySelector("article");
article.innerHtml = data.html;
```

Now, what if you could take this same code, and run it at _build_ time? Move this to a server context, you [usually run into this](https://www.google.com/search?q=document+is+not+defined):

<div class="flex flex-col items-center justify-center gap-4">
    <div
        class="flex -rotate-2 items-center justify-center border-2 border-destructive px-4 py-3 font-mono rounded"
    >
        ReferenceError: document is not defined
    </div>
</div>

Most frameworks require you to learn a new strategy for rendering on the server, for example using JSX, or a markdown file with front-matter variables.

```jsx
// ReactServerComponent.jsx
const ServerComponent = () => {
    const res = await fetch("https://my-cms...");
    const data = await res.json();
    return <article>{data.html}</article>;
};

export default ServerComponent;
```

These strategies work well, but also create another abstraction on top of what you already know. They also have some limitations, for example, what if you want to modify the result of some markdown after it gets processed into HTML? It quickly becomes difficult without something like `document.querySelector`.

> JavaScript is great at manipulating the DOM.

--- [The Primeagen](https://youtu.be/UdCXUVhVSEE?t=3202)

With **domco** you do not need learn a new API, UI framework, or even language to update HTML at build time. You can just make updates to the HTML using familiar browser APIs within a build function, ensuring less JavaScript get shipped to each user.

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

**domco** aims to provide many of the features and developer experience of modern frameworks without having to learn a new language.

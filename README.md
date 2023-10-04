# domco

## Build-Time Rendering Without Templates

In contrast to other static site generators, which often require familiarization with various template file types, **domco** presents an refreshing solution. It enables you to utilize familiar front-end JavaScript standard APIs on the server at build time, and work undeterred by the shifts in the landscape of server side JavaScript tooling.

Take for instance, fetching data from a CMS and having it rendered on a page. Your website already handles this task smoothly in the browser.

```js
// client side JavaScript
const res = await fetch("https://my-cms...");
const data = await res.json();
const article = document.querySelector("article");
article.innerHtml = data.html;
```

Now, what if you could take this same code, and run it to update the HTML at _build_ time? **domco** enables you to do exactly that.

```ts
// src/routes/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
	const res = await fetch("https://my-cms...");
	const data = await res.json();
	const article = document.querySelector("article");
	article.innerHtml = data.html;
};
```

## Tooling

**domco** is built on the latest technologies that provide a great developer experience with near instant feedback.

-   [Vite](https://vitejs.dev)
-   [esbuild](https://esbuild.github.io/)
-   [linkedom](https://github.com/WebReflection/linkedom)

---

## Getting Started

```bash
npm create domco@latest
```

**domco** is a Vite plugin that adds the following functionality.

### HTML

#### index

Routes are located in `src/routes` - this serves as the root directory of your Vite project. This mimics the structure of your output directory. To create another route, simply add another `index.html` file in another directory within `src/routes`.

Each of the `index.html` pages in `src/routes` are processed as separate entry points automatically.

For example, to add the `/nested` route, add `src/routes/nested/index.html`.

#### layout

A `layout.html` file can be utilized to create a layout that wraps around the content of other pages. Include a `<slot></slot>` within the layout that designates where `index.html` should be rendered.

Layouts wrap _all nested routes_. For example, `src/routes/layout.html` also wraps `src/routes/nested/index.html`.

Layouts can be created in any directory within `src/routes`, and will apply to all other nested `index.html` files.

Imports in this file are relative to the final `index.html` page, if you want to have the same file imported in all routes using a layout, use a absolute path instead of a relative one.

-   `/style.css` - adds `src/routes/style.css` to every page
-   `./style.css` - adds `src/routes/[currentRoute]/style.css` to every page

### Build

#### index.build

An `index.build.ts` or `index.build.js` file can be created to modify the contents of `./index.html` at _build_ time. These files must export a `build` function that modifies the passed in `window` object created from `./index.html` with `linkedom`.

Any of the properties on `window` are available through the first argument. [Document methods](https://developer.mozilla.org/en-US/docs/Web/API/Document) or other rendering techniques can be utilized to create new content and make updates at build time. You can run the code contained in the `build` function body on the client to have it rendered on the client instead.

```ts
// src/routes/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
	const p = document.createElement("p");
	p.textContent = "A server rendered paragraph.";
	document.body.appendChild(p);
};
```

#### layout.build

A `layout.build` file can also be created which executes on the current route and all nested routes.

### Block

When you need to import from another module that also uses `window` methods, you'll need to use _dependency injection_ since these are not available to a server side JavaScript runtime. To do this, provide the `window` methods as an argument to those imported functions. **domco** provides a type `Block` to help with this. Blocks can be run on the client or the server by passing in the `window` object from the `build` function, or from the browser's runtime.

```ts
// src/lib/blocks/myBlock.ts
import { Block } from "domco";

export const functionThatUsesDocument: Block = async ({ document }) => {
	document.querySelector("p");
	...
}
```

And then in a `.build` file you can utilize these modules.

```ts
// src/routes/index.build.ts
import { addBlocks, type Build } from "domco";
import { functionThatUsesDocument } from "$lib/blocks/myBlock.ts";

export const build: Build = async (window) => {
	await functionThatUsesDocument(window);
```

#### addBlocks

**domco** also provides a helper function to run multiple blocks asynchronously---`addBlocks`. This can be utilized in a `build` function, or on the client directly.

```ts
// src/routes/index.build.ts
import { addBlocks, type Build } from "domco";
import { functionThatUsesDocument, anotherFunction } from "$lib/blocks/myBlock.ts";

export const build: Build = async (window) => {
	await addBlocks(window, [functionThatUsesDocument, anotherFunction]);
```

### public

The `src/public` directory is for housing static assets that you do not want modified in your final build, these will be copied into the output directory. For example, to reference `../public/image.png`, write `/image.png`.

### lib

`src/lib` has been configured with the `$lib` alias for convenience. This is a good place to house shared code that will be imported in other places in your project such as blocks or types.

### Deploy

Since **domco** is just a Vite plugin, it can be deployed on services like Vercel with zero configuration. You can also build locally and output to `./dist`.

# domco

## Build-Time Rendering Without Templates

Breaking free from the constraints of traditional static site generators, which often dictate familiarization with various template file types, **domco** presents an refreshing solution. It encourages you to utilize the JavaScript standard APIs that you are familiar with, and work undeterred by the shifts in the landscape of server side JavaScript tooling.

Take for instance, fetching data from a CMS and having it rendered on a page. Your website already handles this task smoothly in the browser.

```js
// client side JavaScript
const res = await fetch("https://my-cms...");
const data = await res.json();
const article = document.querySelector("article");
article.innerHtml = data.html;
```

Now, what if you could take this same code, the knowledge you already possess, and leverage them to update the document on the backend at _build_ time? **domco** enables you to do exactly that.

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

### HTML

#### index.html

Routes are located in `src/routes` - this serves as the root directory of your Vite project. To create another route, simply add another `index.html` file in another directory within `src/routes`.

Each of the `index.html` pages in `src/routes` are processed as separate entry points by Vite.

For example, to add the `/nested` route, add `src/routes/nested/index.html`.

#### layout.html

A `layout.html` file can be utilized to create a layout that wraps around the content of other pages. Be sure to include a `<slot></slot>` within the layout that designates where `index.html` should be rendered.

Layouts wrap all nested routes. For example, `src/routes/layout.html` also wraps `src/routes/nested/index.html`.

Layouts can be created in any directory within `src/routes`, and will apply to all other nested `index.html` files.

### Build

#### index.build

An `index.build.ts` or `index.build.js` file can be created to modify the contents of `./index.html` at _build_ time. These files must export a `build` function that modifies the passed in window. Any of the properties on `window` are available through the first argument, properties like `document`, `customElements`, and `HTMLElement` can be utilized on the server here.

[Document methods](https://developer.mozilla.org/en-US/docs/Web/API/Document) or other rendering techniques can be utilized to create new content and make updates. You can run the code contained in the `build` function body on the client to have it rendered on the client instead.

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

When you need to import from another module that also uses `window` methods, you'll need to use _dependency injection_ since these are not available on the server. To do this, provide the `window` methods as an argument to those imported functions. **domco** provides a type `Block` to help with this. Blocks can be run on the client or the server by passing in the `window` object from the `build` function, or from the browser's runtime.

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

**domco** also provides a helper function to run multiple blocks asynchronously---`addBlocks`. This can be utilized on in a build function, or on the client.

```ts
// src/routes/index.build.ts
import { addBlocks, type Build } from "domco";
import { functionThatUsesDocument, anotherFunction } from "$lib/blocks/myBlock.ts";

export const build: Build = async (window) => {
	await addBlocks(window, [functionThatUsesDocument, anotherFunction]);
```

### public

The `src/public` directory is for housing static assets that you do not want modified in your final build, these will be copied into the output directory.

### lib

`src/lib` has been configured with the `$lib` alias for convenience. This is a good place to house shared code that will be imported in other places in your project.

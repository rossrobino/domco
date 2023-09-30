# domco

**domco** is a Vite plugin that allows you to use `window` methods on the server at build time. You can copy client side code into a loader to run at build time instead.

## Tooling

-   [vite](https://vitejs.dev)
-   [esbuild](https://esbuild.github.io/)
-   [linkedom](https://github.com/WebReflection/linkedom)

---

## Getting Started

### index.html

Routes are located in `src/routes` - this serves as the root directory of your Vite project. To create another route, simply add another `index.html` file in another directory within `src/routes`.

Each of the `index.html` pages in `src/routes` are processed as separate entry points by vite.

For example, to add the `/nested` route, add `src/routes/nested/index.html`.

### layout.html

A `layout.html` file can be utilized to create a layout that wraps around the content of other pages. Be sure to include a `<slot></slot>` within the layout that designates where `index.html` should be rendered.

Layouts wrap all nested routes. `src/routes/layout.html` also wraps `src/routes/nested/index.html`.

Layouts can be created in any directory within `src/routes`, and will apply to all other nested `index.html` files.

### index.build

An `index.build.ts` or `index.build.js` file can be created to modify the contents of `./index.html` at _build_ time. Any of the properties on `window` are available through the first argument, properties like `document`, `customElements`, and `HTMLElement` can be utilized on the server here.

[Document methods](https://developer.mozilla.org/en-US/docs/Web/API/Document) or other rendering techniques can be utilized to create new content and make updates. You can run this same code contained in the function body on the client to have it rendered on the client instead.

```ts
// src/routes/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
	const main = document.querySelector("main");
	const p = document.createElement("p");
	p.textContent = "A server rendered paragraph.";
	main?.append(p);
};
```

### layout.build

A `layout.build` file can also be created which executes on all nested `index.html` files.

### public

The `src/public` directory is for housing static assets that you do not want modified in your final build, these will be copied into the output directory.

### lib

`src/lib` has been configured with the `$lib` alias for convenience. This is a good place to house shared code that will be imported in other places in your project.

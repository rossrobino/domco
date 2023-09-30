# domco

## The JavaScript Meta-Framework

If you want to build a website that is statically generated at build time with dynamic content, most would reach for a framework that includes some sort of template file type that you have to learn. This could be considered overkill in many situations and leaves you with skills and dependencies that go out of date.

With **domco** you can take the skills you have on the frontend, and write the same code on the backend to update the document at _build_ time.

**domco** is a Vite plugin that allows you to use `window` methods on the server at build time. You can copy client side code directly into a loader to run at build time instead.

## Tooling

**domco** is built on the latest technologies that provide a great developer experience.

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

#### addBlocks

### public

The `src/public` directory is for housing static assets that you do not want modified in your final build, these will be copied into the output directory.

### lib

`src/lib` has been configured with the `$lib` alias for convenience. This is a good place to house shared code that will be imported in other places in your project.

## Create

To get started, you'll need to have [Node.js](https://nodejs.org) or another server side JavaScript runtime installed on your computer.

Run this command in your terminal and follow the instructions provided.

```bash
npm create domco@latest
```

This command creates files in your project's directory instead of having to manually set up the plugin with Vite.

The following documentation covers the basics of creating a site and all of the features **domco** provides in addition to Vite. See the [Vite documentation](https://vitejs.dev/) for more information and configuration options.

## HTML

### index

By default, your project is located in `src`---this serves as the root directory of your Vite project. `src/index.html` can be accessed at `https://website.com/`, while `src/nested/index.html` can be accessed at `https://website.com/nested/`.

> You can set `root` in your `vite.config` file to a different directory if you prefer.

To create another page, add another `index.html` file in another directory within the root directory.

**domco** configures Vite to process each `index.html` page in the root directory as a separate entry point automatically. Everything linked in these pages will be bundled and included in the output upon running `vite build`.

For example, to add the `/nested/` page, add `src/nested/index.html`.

```
.
└── src/
	├── index.html
	└── nested/
		└── index.html
```

Now you can navigate to nested with an anchor tag.

```html
<a href="/nested/">Nested</a>
```

> By default in Vite, _you must use a trailing slash_ `/nested/` to navigate to `src/nested/index.html`.

## Styling

Styles can be linked to an HTML page using the `link` tag within the `head` tag. If you used the `create-domco` script, this has been configured for you.

> Notice that the `href` for these links are relative to the root directory---this tag will link `src/style.css`.

```html
<!-- index.html -->
<link rel="stylesheet" href="/style.css" />
```

## Client Side JavaScript

**domco** doesn't do anything extra on top of Vite involving client side JavaScript. To include JavaScript in a page that needs to be executed in the browser when a user navigates to the page, add a JavaScript or TypeScript file within your root. This file can be named whatever you want, in this case `index.ts`.

```
.
└── src/
	├── index.ts
	├── index.html
	└── nested/
		└── index.html
```

```ts
// src/index.ts
console.log("Hello from the client!");
```

Then in the HTML file that you want to utilize the script in, add a `script` tag with a `src` attribute that links to the file relative to the root.

```html
<!-- index.html -->
<script type="module" src="/index.ts"></script>
```

Now that this script is included in an entry point `index.html`, the script, and anything that is imported, will be bundled and included in the final build.

## Config

The most powerful feature **domco** provides is the ability to modify pages at build time in a variety of ways. To do this create a `+config` file. This file exports a `config` object to run build time modifications.

```ts
// src/+config.ts
import type { Config } from "domco";

export const config: Config = {
	build: async ({ document }) => {
		// modifies `./index.html` in the same directory.
	},

	layoutBuild: async ({ document }) => {
		// modifies `./index.html` and all nested `./**/index.html` pages.
	},

	// wraps `./index.html` and all nested `./**/index.html` pages.
	layout: await fs.readFile("src/layout.html", "utf-8"),

	// specify parameters for dynamic routes.
	params: [
		{ slug: "first-post" },
		{ slug: "second-post" },
		{ slug: "third-post" },
	],
};
```

`+config` can be renamed if you prefer within your `vite.config`:

```ts
// vite.config
import { defineConfig } from "vite";
import { domco } from "domco/plugin";

export default defineConfig({
	plugins: [
		domco({
			configFileName: "customConfigFileName",
		}),
	],
});
```

### build

When building a website, it's often useful to render content with JavaScript instead of manually writing HTML. This can be accomplished through including client side JavaScript.

Rendering on the client has some drawbacks, especially if the content that is rendered is the same for every user. Browsers process HTML first before JavaScript, so if the JavaScript to render the HTML hasn't run yet, users won't see the resulting HTML until it has completed. This can lead to an undesirable experience if the user has to wait for the page to load, or the content they are viewing shifts after it loads.

**domco** uses [jsdom](https://github.com/jsdom/jsdom) to enable you to utilize the same code that is written on the client, to update the HTML at _build_ time. This way, the code gets ran once, and users enjoy a "pre-rendered" result without having to load any JavaScript.

A `build` function can be provided in your `config` to modify the contents of the `index.html` file in the same directory at _build_ time. This function modifies the passed in `window` object created from `./index.html` with [jsdom](https://github.com/jsdom/jsdom).

```ts
// src/+config.ts
import type { Config } from "domco";

export const config: Config = {
	build: async ({ document }) => {
		const p = document.createElement("p");
		p.textContent = "A server rendered paragraph.";
		document.body.appendChild(p);
	},
};
```

Any of the properties on `window` are available through the first argument such as `document` or `HTMLElement`. [Document methods](https://developer.mozilla.org/en-US/docs/Web/API/Document) or other rendering techniques can be utilized to create new content and make updates at build time. You can run the code contained in the `build` function body on the client to have it rendered on the client instead.

> This code is not included in your final bundle, the `build` function only modifies HTML. If you need to have client side interactivity, include a [client side script](#client-side-javascript).
>
> For example, running `document.addEventListener` in a `build` function, will not change the resulting HTML. Put this into a client side script.

Since this module runs during build time, server side JavaScript like NodeJS APIs can be utilized here. For example, you can use `fs.readFile` in a `build` function to read a markdown file, convert it to HTML, and then insert the HTML into the page using `window` methods.

### layoutBuild

A `layoutBuild` function can also be created which modifies the current page and _all nested pages_.

For example, if you want the same `build` function to modify every page, add a `layoutBuild` to the `config` object. This script now runs on `src/index.html` and `src/nested/index.html`.

### layout

Layouts can be utilized to create a layout that wraps around the content of other pages. Layouts make it easier to apply markup, styles, and scripts to multiple pages without having to rewrite code. For example, if you have a navigation bar that renders on every page, you could put this HTML within a layout to render it on every page.

> `layout` can be set directly to a string. But, it's often easier to create a separate file for your layout and use a file system module like `node:fs` to read the file instead. This provides some flexibility for you to store your layouts where you prefer.

Include a `<slot></slot>` within the layout that designates where `./index.html` should be rendered. If you selected to include a layout when creating your project, this is already created for you.

- Layouts wrap _all nested pages_. For example, `src/layout.html` also wraps `src/nested/index.html`.
- Layouts can be created in any directory within your root, and will apply to all other nested `index.html` files within the directory it is created in.

## Dynamic Routes

Generate pages dynamically using brackets as directory names.

```
.
└── src/
	└── posts/
		└── [slug]/
			├── +config.ts
			└── index.html
```

Then in `+config` you can provide the possible parameters with the `params` array. `params` can also be calculated programmatically. Optionally, pass `typeof params` to `Config` to create a type for the `params` object within [`BuildContext`](/docs/modules/#buildcontext).

```ts
// src/posts/[slug]/+config.ts
import type { Config } from "domco";

const params = [
	{ slug: "first-post" },
	{ slug: "second-post" },
	{ slug: "third-post" },
] as const;

export const config: Config<typeof params> = {
	params,
	build: async ({ document }, { params }) => {
		const h1 = document.querySelector("h1");
		if (h1) h1.textContent = params.slug; // "first-post" | "second-post" | "third-post"
	},
};
```

This configuration would generate the following file structure.

```
.
└── src/
	└── posts/
		├── first-post/
		│   └── index.html
		├── second-post/
		│   └── index.html
		└── third-post/
			└── index.html
```

In the case of `src/posts/[slug]/nested/[another]`, specify a key for each parameter: `{ slug: "slug", another: "another" }`.

## Block

Sometimes you'll need to reuse code in multiple `build` functions that reside in different files. If the code that needs to be reused utilizes the `window` object, for example `document.querySelector`, then you'll need to create a `Block` since `window` is not available to a server side JavaScript runtime by default.

To do this, provide `window` as an argument to those imported functions. **domco** provides a type [`Block`](/docs/modules#block) to help with this. Blocks can be run on the client or the server by passing in the `window` object from the `build` function, or from the browser's runtime.

```ts
// src/lib/blocks/myBlock.ts
import type { Block } from "domco";

export const functionThatUsesDocument: Block = async ({ document }) => {
	document.querySelector("p");
	...
}
```

And then in a `+config` file you can utilize these modules.

```ts
// src/+config.ts
import type { Config } from "domco";
import { functionThatUsesDocument } from "$lib/blocks/myBlock.ts";

export const config: Config = {
	build: async (window) => {
		await functionThatUsesDocument(window);
	},
};
```

**domco** also provides a helper function to run multiple blocks asynchronously---[`addBlocks`](/docs/modules/#addblocks).

## Components

One common use case for JavaScript framework components is to reuse chunks of HTML. One way to accomplish this on the server is by using the web platform's [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) within a `Build` or `Block` function.

```ts
// src/+config.ts
import type { Config } from "domco";

export const config: Config = {
	build: ({ customElements, HTMLElement }) => {
		customElements.define(
			"my-custom-element",
			class extends HTMLElement {
				connectedCallback() {
					this.innerHTML = /* html */ `
						<div>My custom div.</div>
					`;
				}
			},
		);
	},
};
```

Then, in your HTML, you can utilize this custom element declaratively.

```html
<my-custom-element></my-custom-element>
```

> These custom elements will not be interactive since they are only running on the server.

If you're using VS Code as your editor, [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) is a nice extension to get syntax highlighting for HTML within strings.

## public

The [`public` directory](https://vitejs.dev/guide/assets.html#the-public-directory) is for housing static assets that you do not want modified in your final build, these will be copied into the output directory as they are. To reference these files just use `/file`. For example, to reference `public/image.png`, write `/image.png`.

> **domco** has configured `public` to exist outside of `src`, this can be changed to wherever you prefer in your `vite.config`.

## lib

`src/lib/` has been configured with the `$lib/` alias for convenience. This is a good place to house shared code that will be imported in other places in your project.

## Building for Production

Run the following command to execute `vite build` and build your project, you will see the results outputted to the `dist` folder.

```bash
npm run build
```

### HTML Minification

**domco** minifies html during during build using [html-minifier-terser](https://github.com/terser/html-minifier-terser). You can change the default settings in your `vite.config`.

```ts
// vite.config
import { defineConfig } from "vite";
import { domco } from "domco/plugin";

export default defineConfig({
	plugins: [
		domco({
			minifyHtmlOptions: {
				removeComments: false,
			},
		}),
	],
});
```

### Deploy

**domco** generates a static site, which makes it easy to deploy on a variety of platforms.

Since **domco** is a Vite plugin, it can be deployed on many services with zero configuration. These services will run `vite build` on a remote server for you and deploy your project to a content delivery network. This site is deployed on [Vercel](https://vercel.com).

Check out the Vite's documentation on [deploying a static site](https://vitejs.dev/guide/static-deploy) to learn more.

## Create

After you're familiar with HTML, CSS, JavaScript, and Node, [Vite](https://vitejs.dev/) is a great tool to build a website. It is a build tool that many popular frameworks today use under the hood. At a high level, it provides two key scripts, `dev`---a development server, and `build`---a bundler.

The development server makes it easier to see updates in your website as you make changes, while the build command helps you ship the minimum amount of code that is required for your site to run to users.

**domco** is a plugin that configures Vite in a way that makes it easier to use to create multi-page websites. To get started, run this command in the terminal.

You can utilize JavaScript or TypeScript, examples in this documentation are in TypeScript.

```bash
npm create domco@latest
```

This command creates files in your project's directory instead of having to manually set up the plugin with Vite.

Next, follow the instructions to install dependencies and start Vite's development server.

You should see a new browser window open with the text "Hello world!" displayed.

## HTML

### index

Your project is located in `src` - this serves as the root directory of your Vite project. To create another route, add another `index.html` file in another directory within `src`.

**domco** configures Vite to process each `index.html` page in `src` as a separate entry point automatically. Everything linked in these pages will be bundled and included in the output upon running `npm run build` or `vite build`.

For example, to add the `/nested` route, add `src/nested/index.html`.

```
.
└── src/
	├── index.html
	└── nested/
		└── index.html
```

### layout

A `layout.html` file can be utilized to create a layout that wraps around the content of other pages. Include a `<slot></slot>` within the layout that designates where `index.html` should be rendered. If you selected to include a layout when creating your project, this is already included for you.

Layouts make it easier to apply markup, styles, and scripts to multiple pages without having to rewrite any code.

```
.
└── src/
	├── index.html
	├── layout.html
	└── nested/
		└── index.html
```

Layouts wrap _all nested routes_. For example, `src/layout.html` also wraps `src/nested/index.html`.

Layouts can be created in any directory within `src`, and will apply to all other nested `index.html` files.

## Styling

Styles can be linked to an HTML page using the `link` tag within the `head` tag. If you used the `create` script, this has been configured for you.

```html
<!-- index.html -->
<link rel="stylesheet" href="/style.css" />
```

## Client Side JavaScript

**domco** doesn't do anything extra on top of Vite involving client side JavaScript. To include JavaScript in a page that needs to be executed in the browser when a user navigates to the page, add a JavaScript or TypeScript file within `src`. This file can be named whatever you want, if the script is only used on one page, you might name it after the page---in this case `index.client`.

```
.
└── src/
	├── index.client.ts
	├── index.html
	├── layout.html
	└── nested/
		└── index.html
```

```ts
// src/index.client.ts
console.log("Hello from the client!");
```

Then in the HTML file that you want to utilize the script in, add a `script` tag with a `src` attribute that links to the file.

```html
<!-- index.html -->
<script type="module" src="/index.client.ts"></script>
```

Now that this script is included in the entry point `index.html`, the script, and anything that is imported, will be bundled and included in the final build.

## Build

When building a website, it's often useful to render content with JavaScript instead of manually writing HTML. This can be accomplished through including client side JavaScript.

Rendering on the client has some drawbacks, especially if the content that is rendered is the same for every user. Browsers process HTML first before JavaScript, so if the JavaScript to render the HTML hasn't run yet, users won't see the resulting HTML until it has completed. This can lead to an undesirable experience if the user has to wait for the page to load, or the content they are viewing shifts after it loads.

**domco** uses [jsdom](https://github.com/jsdom/jsdom) to enable you to utilize the same code that is written on the client, to update the HTML at _build_ time. This way, the code gets ran once, and users enjoy a "pre-rendered" result without having to load any JavaScript.

### index.build

An `index.build` file can be created to modify the contents of the `index.html` file in the same directory at _build_ time. These files must export a [`build`](/docs/modules#build) function that modifies the passed in `window` object created from `./index.html` with [jsdom](https://github.com/jsdom/jsdom).

```ts
// src/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
	const p = document.createElement("p");
	p.textContent = "A server rendered paragraph.";
	document.body.appendChild(p);
};
```

Any of the properties on `window` are available through the first argument such as `document` or `HTMLElement`. [Document methods](https://developer.mozilla.org/en-US/docs/Web/API/Document) or other rendering techniques can be utilized to create new content and make updates at build time. You can run the code contained in the `build` function body on the client to have it rendered on the client instead.

> `index.build` files are not included in your final bundle, the `build` function only modifies HTML. If you need to have client side interactivity, include a [client side script](#client-side-javascript). For example, running `document.addEventListener` in an `index.build` file, will not change the resulting HTML.

Since this module runs during build time, server side JavaScript like NodeJS APIs can be utilized here. For example, you can use `fs.readFile` in a `build` function to read a markdown file, convert it to HTML, and then insert the HTML into the page using `window` methods.

### layout.build

A `layout.build` file can also be created which executes on the current route and all nested routes.

```
.
└── src/
	├── index.html
	├── layout.build.ts
	├── layout.html
	└── nested/
		└── index.html
```

For example, if you want the same `build` script to run on every page, add a `layout.build` to `src`. This script would be run on `src/index.html` and `src/nested/index.html`.

> `layout.build` executes before `index.build`.

## Dynamic Routes

Specify dynamic routes to generate using brackets as directory names.

```
.
└── src/
	└── posts/
		└── [slug]/
			├── index.build.ts
			└── index.html
```

Then in `index.build` you can provide the possible parameters by exporting a `params` array. `params` can also be calculated programmatically. Pass `typeof params` to `Build` to create a type for the `params` object within [`BuildContext`](/docs/modules#buildcontext).

```ts
// src/posts/[slug]/index.build.ts
import { Build } from "domco";

export const params = [
	{ slug: "first-post" },
	{ slug: "second-post" },
	{ slug: "third-post" },
] as const;

export const build: Build<typeof params> = async ({ document }, { params }) => {
	const h1 = document.querySelector("h1");
	if (h1) h1.textContent = params.slug; // "first-post" | "second-post" | "third-post"
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

In the case of `src/posts/[slug]/nested/[another]/index.build.ts`, specify a key for each parameter: `{ slug: "slug", another: "another" }`.

## Block

Sometimes you'll need to reuse code in multiple `build` functions that reside in different files. If the code that needs to be reused utilizes the `window` object, for example `document.querySelector`, then you'll need to create a `Block` since `window` is not available to a server side JavaScript runtime by default.

To do this, provide `window` as an argument to those imported functions. **domco** provides a type [`Block`](/docs/modules#block) to help with this. Blocks can be run on the client or the server by passing in the `window` object from the `build` function, or from the browser's runtime.

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
// src/index.build.ts
import type { Build } from "domco";
import { functionThatUsesDocument } from "$lib/blocks/myBlock.ts";

export const build: Build = async (window) => {
	await functionThatUsesDocument(window);
};
```

**domco** also provides a helper function to run multiple blocks asynchronously---[`addBlocks`](/docs/modules#addblocks).

## domco API

**domco** functions can be imported from `"domco"`, [read more about them here](/docs/modules#functions-1).

## public

The [`public` directory](https://vitejs.dev/guide/assets.html#the-public-directory) is for housing static assets that you do not want modified in your final build, these will be copied into the output directory as they are. To reference these files just use `/file`. For example, to reference `public/image.png`, write `/image.png`.

## lib

`src/lib` has been configured with the `$lib` alias for convenience. This is a good place to house shared code that will be imported in other places in your project such as blocks or types.

## Building for Production

Run the following command to execute `vite build` and build your project, you will see the results outputted to the `dist` folder.

```bash
npm run build
```

### HTML Minification

**domco** minifies html during during build using [html-minifier-terser](https://github.com/terser/html-minifier-terser).

### Deploy

**domco** generates a static site, which makes it easy to deploy on a variety of platforms.

Since **domco** is a Vite plugin, it can be deployed on services like [Vercel](https://vercel.com/) with zero configuration. These services will run `vite build` on a remote server for you and deploy your project to a content delivery network.

## Type Aliases

<a id="adapter" name="adapter"></a>

### Adapter

> **Adapter**: `object`

#### Type declaration

<a id="devmiddleware" name="devmiddleware"></a>

##### devMiddleware?

> `optional` **devMiddleware**: [`CreateAppOptions`](globals.md#createappoptions)\[`"middleware"`\]

Middleware to apply in `dev` mode.
For production middleware, export it from the adapter module,
and then import into the entry point.

<a id="entry" name="entry"></a>

##### entry

> **entry**: [`AdapterEntry`](globals.md#adapterentry)

Entry point for the server application.

<a id="message" name="message"></a>

##### message

> **message**: `string`

Message to log when the build is complete.

<a id="name" name="name"></a>

##### name

> **name**: `string`

The name of the adapter.

<a id="noexternal" name="noexternal"></a>

##### noExternal?

> `optional` **noExternal**: `SSROptions`\[`"noExternal"`\]

Passed into Vite `config.ssr.noExternal`.

<a id="previewmiddleware" name="previewmiddleware"></a>

##### previewMiddleware?

> `optional` **previewMiddleware**: [`CreateAppOptions`](globals.md#createappoptions)\[`"middleware"`\]

Middleware to apply in `preview` mode.
For production middleware, export it from the adapter module,
and then import into the entry point.

<a id="run" name="run"></a>

##### run()?

> `optional` **run**: () => `any`

The script to run after Vite build is complete.

###### Returns

`any`

<a id="target" name="target"></a>

##### target?

> `optional` **target**: `SSRTarget`

Passed into Vite `config.ssr.target`.

#### Defined in

[types/public/index.ts:44](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L44)

---

<a id="adapterbuilderadapteroptions" name="adapterbuilderadapteroptions"></a>

### AdapterBuilder()\<AdapterOptions\>

> **AdapterBuilder**\<`AdapterOptions`\>: (`AdapterOptions`?) => `MaybePromise`\<[`Adapter`](globals.md#adapter)\>

#### Type Parameters

• **AdapterOptions** = `never`

#### Parameters

• **AdapterOptions?**: `AdapterOptions`

#### Returns

`MaybePromise`\<[`Adapter`](globals.md#adapter)\>

#### Defined in

[types/public/index.ts:78](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L78)

---

<a id="adapterentry" name="adapterentry"></a>

### AdapterEntry()

> **AdapterEntry**: (`AdapterEntryOptions`) => `object`

#### Parameters

• **AdapterEntryOptions**

• **AdapterEntryOptions.appId**: `string`

The app entrypoint to import `createApp` from.

#### Returns

`object`

##### code

> **code**: `string`

Code for the entrypoint.

##### id

> **id**: `string`

The name of the entrypoint without extension.

###### Example

```ts
"main";
```

#### Defined in

[types/public/index.ts:29](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L29)

---

<a id="client" name="client"></a>

### Client()

> **Client**: (`routePath`?) => `HtmlEscapedString`

#### Parameters

• **routePath?**: `string`

#### Returns

`HtmlEscapedString`

#### Defined in

[types/public/index.ts:141](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L141)

---

<a id="createappmiddleware" name="createappmiddleware"></a>

### CreateAppMiddleware

> **CreateAppMiddleware**: `object`

#### Type declaration

<a id="handler" name="handler"></a>

##### handler

> **handler**: `MiddlewareHandler`

The middleware to apply.

<a id="path" name="path"></a>

##### path

> **path**: `string`

Path to apply the middleware to.

#### Defined in

[types/public/index.ts:7](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L7)

---

<a id="createappoptions" name="createappoptions"></a>

### CreateAppOptions

> **CreateAppOptions**: `object`

#### Type declaration

<a id="devserver" name="devserver"></a>

##### devServer?

> `optional` **devServer**: `ViteDevServer`

Only used in `dev` to call the server.

<a id="honooptions" name="honooptions"></a>

##### honoOptions?

> `optional` **honoOptions**: `HonoOptions`\<`Env`\>

Passthrough options to the Hono app.

<a id="middleware" name="middleware"></a>

##### middleware?

> `optional` **middleware**: [`CreateAppMiddleware`](globals.md#createappmiddleware)[]

Middleware to be applied before any routes. Useful for adapters that need to
inject middleware.

#### Defined in

[types/public/index.ts:15](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L15)

---

<a id="domcoconfig" name="domcoconfig"></a>

### DomcoConfig

> **DomcoConfig**: `object`

domco Config

Use if you want to create a separate object for your domco config.
Pass the config into the `domco` vite plugin.

#### Type declaration

<a id="adapter-1" name="adapter-1"></a>

##### adapter?

> `optional` **adapter**: `ReturnType`\<[`AdapterBuilder`](globals.md#adapterbuilderadapteroptions)\>

domco adapter.

Defaults to `undefined` - creates a `app` build only.

###### Default

```ts
undefined;
```

###### Example

```js
import { adapter } from `"domco/adapter/...";`
```

#### Example

```ts
// vite.config.ts
import { domco, type DomcoConfig } from "domco";
import { defineConfig } from "vite";

const config: DomcoConfig = {
	// options...
};

export default defineConfig({
	plugins: [domco(config)],
});
```

#### Defined in

[types/public/index.ts:104](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L104)

---

<a id="domcocontextvariablemap" name="domcocontextvariablemap"></a>

### DomcoContextVariableMap

> **DomcoContextVariableMap**: `object`

Extend Hono's variable map with domco's.

[Hono reference](https://hono.dev/docs/api/context#contextvariablemap)

#### Type declaration

<a id="client-1" name="client-1"></a>

##### client

> **client**: [`Client`](globals.md#client)

The script tags for any `+client.(js,ts,jsx,tsx)` within `src` can be accessed through the `client` context variable.
This is useful if you are wanting to include a client side script but are not using a `page` file for your HTML, since
the names of these tags will be different after your client application has been built.

For example, if you are using JSX to render the markup for your application you can utilize the `client` variable to include
client side scripts.

Also, the link tags for any `css` imported into the script will be included.

In development, the tags will link directly to the script.

In production, domco will read `dist/client/.vite/manifest.json` and use the hashed file names generated from the build.

###### Param

If `routePath` is left `undefined`, the current route's `./+client.(js,ts,jsx,tsx)` will be returned.
Otherwise, you can use an alternative `routePath` to get a different route's tags.

###### Example

```tsx
// HTML example
// src/.../+server.(js,ts,jsx,tsx)

import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

app.get("/", (c) => {
	// gets `./+client.(js,ts,jsx,tsx)`
	const tags = c.var.client();

	// gets `src/route/path/+client.(js,ts,jsx,tsx)`
	const differentTags = c.var.client("/route/path")

	return c.html(html`
		${tags}
		<p>Partial with client side script</p>
	`);
});

export default app;

// JSX example

app.get("/", (c) => {
	return c.html(
		<>
			{c.var.client()}
			<p>Partial with client side script</p>
		</>
	`);
});
```

<a id="page" name="page"></a>

##### page

> **page**: [`Page`](globals.md#page-1)

Any `+page.html` within `src` can be accessed through the `page` context variable.
This provides the HTML after processing by Vite.

###### Param

If `routePath` is left `undefined`, the current route's `./+page.html` will be returned.
Otherwise, you can use an alternative `routePath` to get a different page.

###### Example

```ts
// src/.../+server.(js,ts,jsx,tsx)
import { Hono } from "hono";

app.get("/", (c) => {
	// gets `./+page.html`
	const page = c.var.page();

	// gets `src/route/path/+page.html`
	const differentPage = c.var.page("/route/path");

	return c.html(page);
});

export default app;
```

<a id="server" name="server"></a>

##### server

> **server**: [`Server`](globals.md#server-1)

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) with the origin set, pass in the local path instead of the entire `url`.

###### Param

the local path to request

###### Param

[`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)

###### Example

```ts
// src/.../+server.(js,ts,jsx,tsx)
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	// dev: fetch("http://localhost:5173/route/path")
	// prod: fetch("https://example.com/route/path")
	const res = await c.var.server("/route/path")

	// ...
});

export default app;
```

#### Example

```ts
// src/global.d.ts
/// <reference types="vite/client" />
import type { DomcoContextVariableMap } from "domco";
import "hono";

declare module "hono" {
	interface ContextVariableMap extends DomcoContextVariableMap {}
}
```

#### Defined in

[types/public/index.ts:166](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L166)

---

<a id="page-1" name="page-1"></a>

### Page()

> **Page**: (`routePath`?) => `string`

#### Parameters

• **routePath?**: `string`

#### Returns

`string`

#### Defined in

[types/public/index.ts:139](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L139)

---

<a id="prerender" name="prerender"></a>

### Prerender

> **Prerender**: `string`[] \| `true`

Paths to prerender relative to the current route.

#### Example

```ts
// src/posts/+server.ts
import type { Prerender } from "domco";

// prerender current route
export const prerender: Prerender = true;

// prerender multiple paths relative to the current route.
export const prerender: Prerender = ["/", "/post-1", "/post-2"];
```

#### Defined in

[types/public/index.ts:137](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L137)

---

<a id="server-1" name="server-1"></a>

### Server()

> **Server**: (`pathname`, `init`?) => `MaybePromise`\<`Response`\>

#### Parameters

• **pathname**: `string`

• **init?**: `RequestInit`

#### Returns

`MaybePromise`\<`Response`\>

#### Defined in

[types/public/index.ts:143](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/types/public/index.ts#L143)

## Functions

<a id="domco" name="domco"></a>

### domco()

> **domco**(`domcoConfig`): `Promise`\<`Plugin`\<`any`\>[]\>

Creates domco Vite plugin, add to your `plugins` array within your `vite.config`
to start using domco.

#### Parameters

• **domcoConfig**: [`DomcoConfig`](globals.md#domcoconfig) = `{}`

#### Returns

`Promise`\<`Plugin`\<`any`\>[]\>

The domco Vite plugin.

#### Example

```ts
// vite.config.ts
import { domco } from "domco";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [domco()],
});
```

#### Defined in

[plugin/index.ts:31](https://github.com/rossrobino/domco/blob/f38238a57796e2a9b8fa967033c07be64a4c3b5e/packages/domco/src/plugin/index.ts#L31)

## Type Aliases

<a id="adapter" name="adapter"></a>

### Adapter

> **Adapter**: `object`

#### Type declaration

<a id="entry" name="entry"></a>

##### entry

> **entry**: [`AdapterEntry`](README.md#adapterentry)

Entry point for the server application.

<a id="message" name="message"></a>

##### message

> **message**: `string`

Message to log when the build is complete.

<a id="name" name="name"></a>

##### name

> **name**: `string`

The name of the adapter.

<a id="run" name="run"></a>

##### run()

> **run**: () => `any`

The script to run after Vite build is complete.

###### Returns

`any`

#### Defined in

[types/public/index.ts:12](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L12)

***

<a id="adapterbuilderadapteroptions" name="adapterbuilderadapteroptions"></a>

### AdapterBuilder()\<AdapterOptions\>

> **AdapterBuilder**\<`AdapterOptions`\>: (`AdapterOptions`?) => `MaybePromise`\<[`Adapter`](README.md#adapter)\>

#### Type Parameters

• **AdapterOptions** = `object`

#### Parameters

• **AdapterOptions?**: `AdapterOptions`

#### Returns

`MaybePromise`\<[`Adapter`](README.md#adapter)\>

#### Defined in

[types/public/index.ts:32](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L32)

***

<a id="adapterentry" name="adapterentry"></a>

### AdapterEntry()

> **AdapterEntry**: (`AdapterEntryOptions`) => `Promise`\<`string`\> \| `string`

#### Parameters

• **AdapterEntryOptions**

• **AdapterEntryOptions.appId**: `string`

The app entrypoint to import `createApp` from.

• **AdapterEntryOptions.port**: `number`

domco config port.

#### Returns

`Promise`\<`string`\> \| `string`

#### Defined in

[types/public/index.ts:4](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L4)

***

<a id="client" name="client"></a>

### Client()

> **Client**: (`routePath`?) => `HtmlEscapedString`

#### Parameters

• **routePath?**: `string`

#### Returns

`HtmlEscapedString`

#### Defined in

[types/public/index.ts:102](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L102)

***

<a id="domcoconfig" name="domcoconfig"></a>

### DomcoConfig

> **DomcoConfig**: `object`

domco Config

Use if you want to create a separate object for your domco config.
Pass the config into the `domco` vite plugin.

#### Type declaration

<a id="adapter-1" name="adapter-1"></a>

##### adapter?

> `optional` **adapter**: `ReturnType`\<[`AdapterBuilder`](README.md#adapterbuilderadapteroptions)\>

domco adapter.

Import from `"domco/adapter/..."`

Defaults to `undefined` - creates a NodeJS build only.

###### Default

```ts
undefined
```

<a id="port" name="port"></a>

##### port?

> `optional` **port**: `object`

port numbers.

<a id="dev" name="dev"></a>

##### port.dev?

> `optional` **dev**: `number`

###### Default

```ts
5173
```

<a id="prod" name="prod"></a>

##### port.prod?

> `optional` **prod**: `number`

###### Default

```ts
5173
```

#### Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { domco, type DomcoConfig } from "domco";

const config: DomcoConfig = {
	// options...
};

export default defineConfig({
	plugins: [domco(config)],
});
```

#### Defined in

[types/public/index.ts:58](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L58)

***

<a id="domcocontextvariablemap" name="domcocontextvariablemap"></a>

### DomcoContextVariableMap

> **DomcoContextVariableMap**: `object`

Extend Hono's variable map with domco's.

[Hono reference](https://hono.dev/docs/api/context#contextvariablemap)

#### Type declaration

<a id="client-1" name="client-1"></a>

##### client

> **client**: [`Client`](README.md#client)

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

> **page**: [`Page`](README.md#page-1)

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
	const differentPage = c.var.page("/route/path")

	return c.html(page);
});

export default app;
```

<a id="server" name="server"></a>

##### server

> **server**: [`Server`](README.md#server-1)

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

[types/public/index.ts:127](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L127)

***

<a id="page-1" name="page-1"></a>

### Page()

> **Page**: (`routePath`?) => `string`

#### Parameters

• **routePath?**: `string`

#### Returns

`string`

#### Defined in

[types/public/index.ts:100](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L100)

***

<a id="prerender" name="prerender"></a>

### Prerender

> **Prerender**: `string`[] \| `true`

Paths to prerender relative to the current route.

#### Example

```ts
// src/routes/posts/+server.ts
import type { Prerender } from "domco";

// prerender current route
export const prerender: Prerender = true;

// prerender multiple paths relative to the current route.
export const prerender: Prerender = ["/", "/post-1", "/post-2"];
```

#### Defined in

[types/public/index.ts:98](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L98)

***

<a id="server-1" name="server-1"></a>

### Server()

> **Server**: (`pathname`, `init`?) => `MaybePromise`\<`Response`\>

#### Parameters

• **pathname**: `string`

• **init?**: `RequestInit`

#### Returns

`MaybePromise`\<`Response`\>

#### Defined in

[types/public/index.ts:104](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/types/public/index.ts#L104)

## Functions

<a id="domco" name="domco"></a>

### domco()

> **domco**(`config`?): `Promise`\<`Plugin`\<`any`\>[]\>

Creates domco Vite plugin, add to your `plugins` array within your `vite.config`
to start using domco.

#### Parameters

• **config?**: [`DomcoConfig`](README.md#domcoconfig)

Your domco config object.

#### Returns

`Promise`\<`Plugin`\<`any`\>[]\>

The domco Vite plugin.

#### Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { domco } from "domco";

export default defineConfig({
	plugins: [domco()],
});
```

#### Defined in

[plugin/index.ts:32](https://github.com/rossrobino/domco-v2/blob/9e20bb1b244e6c8e17f57a69ac0272a408978478/packages/domco/src/plugin/index.ts#L32)

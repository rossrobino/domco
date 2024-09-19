## Type Aliases

<a id="adapter" name="adapter"></a>

### Adapter

> **Adapter**: `object`

A domco adapter that configures the build to a target production environment.

#### Type declaration

<a id="devmiddleware" name="devmiddleware"></a>

##### devMiddleware?

> `optional` **devMiddleware**: [`AdapterMiddleware`](globals.md#adaptermiddleware)[]

Middleware to apply in `dev` mode.

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

> `optional` **previewMiddleware**: [`AdapterMiddleware`](globals.md#adaptermiddleware)[]

Middleware to apply in `preview` mode.

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

[types/index.ts:60](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L60)

---

<a id="adapterbuilderadapteroptions" name="adapterbuilderadapteroptions"></a>

### AdapterBuilder()\<AdapterOptions\>

> **AdapterBuilder**\<`AdapterOptions`\>: (`AdapterOptions`?) => [`MaybePromise`](globals.md#maybepromiset)\<[`Adapter`](globals.md#adapter)\>

Use this type to create your own adapter.
Pass any options for the adapter in as a generic.

#### Type Parameters

• **AdapterOptions** = `never`

#### Parameters

• **AdapterOptions?**: `AdapterOptions`

#### Returns

[`MaybePromise`](globals.md#maybepromiset)\<[`Adapter`](globals.md#adapter)\>

#### Defined in

[types/index.ts:90](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L90)

---

<a id="adapterentry" name="adapterentry"></a>

### AdapterEntry()

> **AdapterEntry**: (`AdapterEntryOptions`) => `object`

A function that returns an additional entry point to include in the SSR build.

#### Parameters

• **AdapterEntryOptions**

• **AdapterEntryOptions.appId**: `string`

The app entry point to import `handler` from.

#### Returns

`object`

##### code

> **code**: `string`

Code for the entry point.

##### id

> **id**: `string`

The name of the entry point without extension.

###### Example

```ts
"main";
```

#### Defined in

[types/index.ts:44](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L44)

---

<a id="adaptermiddleware" name="adaptermiddleware"></a>

### AdapterMiddleware

> **AdapterMiddleware**: `Connect.NextHandleFunction`

Middleware used in the Vite server for dev and preview.

#### Defined in

[types/index.ts:41](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L41)

---

<a id="appmodule" name="appmodule"></a>

### AppModule

> **AppModule**: `object`

Exports from the SSR `app` entry point.

#### Type declaration

<a id="handler" name="handler"></a>

##### handler

> **handler**: [`Handler`](globals.md#handler-1)

<a id="prerender" name="prerender"></a>

##### prerender

> **prerender**: [`Prerender`](globals.md#prerender-1)

#### Defined in

[types/index.ts:7](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L7)

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

[types/index.ts:116](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L116)

---

<a id="handler-1" name="handler-1"></a>

### Handler()

> **Handler**: (`req`) => [`MaybePromise`](globals.md#maybepromiset)\<`Response`\>

Request handler, takes a web request and returns a web response.

```ts
// src/server/+app.ts
import type { Handler } from "domco";

export const handler: Handler = async (req) => {
	return new Response("Hello world");
};
```

#### Parameters

• **req**: `Request`

#### Returns

[`MaybePromise`](globals.md#maybepromiset)\<`Response`\>

#### Defined in

[types/index.ts:24](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L24)

---

<a id="maybepromiset" name="maybepromiset"></a>

### MaybePromise\<T\>

> **MaybePromise**\<`T`\>: `T` \| `Promise`\<`T`\>

Helper type for a type that could be a promise.

#### Type Parameters

• **T**

#### Defined in

[types/index.ts:4](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L4)

---

<a id="prerender-1" name="prerender-1"></a>

### Prerender

> **Prerender**: `string`[]

Paths to prerender at build time.

#### Example

```ts
// src/server/+app.ts
import type { Prerender } from "domco";

export const prerender: Prerender = ["/", "/post-1", "/post-2"];
```

#### Defined in

[types/index.ts:38](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L38)

## Functions

<a id="domco" name="domco"></a>

### domco()

> **domco**(`domcoConfig`): `Promise`\<`Plugin`\<`any`\>[]\>

Creates domco Vite plugin, add to your `plugins` array within your `vite.config`
to start using domco.

#### Parameters

• **domcoConfig**: [`DomcoConfig`](globals.md#domcoconfig) = `{}`

Your domco config object.

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

[plugin/index.ts:29](https://github.com/rossrobino/domco/blob/main/packages/domco/src/plugin/index.ts#L29)

## Type Aliases

<a id="adapter"></a>

### Adapter

> **Adapter**: `object`

Defined in: [types/index.ts:63](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L63)

A domco adapter that configures the build to a target production environment.

#### Type declaration

<a id="devmiddleware"></a>

##### devMiddleware?

> `optional` **devMiddleware**: [`AdapterMiddleware`](globals.md#adaptermiddleware)[]

Middleware to apply in `dev` mode.

<a id="entry"></a>

##### entry

> **entry**: [`AdapterEntry`](globals.md#adapterentry)

Entry point for the server application.

<a id="message"></a>

##### message

> **message**: `string`

Message to log when the build is complete.

<a id="name"></a>

##### name

> **name**: `string`

The name of the adapter.

<a id="noexternal"></a>

##### noExternal?

> `optional` **noExternal**: `SSROptions`\[`"noExternal"`\]

Passed into Vite `config.ssr.noExternal`.

<a id="previewmiddleware"></a>

##### previewMiddleware?

> `optional` **previewMiddleware**: [`AdapterMiddleware`](globals.md#adaptermiddleware)[]

Middleware to apply in `preview` mode.

<a id="run"></a>

##### run()?

> `optional` **run**: () => `any`

The script to run after Vite build is complete.

###### Returns

`any`

<a id="target"></a>

##### target?

> `optional` **target**: `SSRTarget`

Passed into Vite `config.ssr.target`.

---

<a id="adapterbuilderadapteroptions"></a>

### AdapterBuilder()\<AdapterOptions\>

> **AdapterBuilder**\<`AdapterOptions`\>: (`AdapterOptions`?) => [`MaybePromise`](globals.md#maybepromiset)\<[`Adapter`](globals.md#adapter)\>

Defined in: [types/index.ts:93](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L93)

Use this type to create your own adapter.
Pass any options for the adapter in as a generic.

#### Type Parameters

• **AdapterOptions** = `never`

#### Parameters

##### AdapterOptions?

`AdapterOptions`

#### Returns

[`MaybePromise`](globals.md#maybepromiset)\<[`Adapter`](globals.md#adapter)\>

---

<a id="adapterentry"></a>

### AdapterEntry()

> **AdapterEntry**: (`AdapterEntryOptions`) => `object`

Defined in: [types/index.ts:47](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L47)

A function that returns an additional entry point to include in the SSR build.

#### Parameters

##### AdapterEntryOptions

###### funcId

`string`

The function entry point to import `handler` from.

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

---

<a id="adaptermiddleware"></a>

### AdapterMiddleware

> **AdapterMiddleware**: `Connect.NextHandleFunction`

Defined in: [types/index.ts:44](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L44)

Middleware used in the Vite server for dev and preview.

---

<a id="domcoconfig"></a>

### DomcoConfig

> **DomcoConfig**: `object`

Defined in: [types/index.ts:119](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L119)

domco Config

Use if you want to create a separate object for your domco config.
Pass the config into the `domco` vite plugin.

#### Type declaration

<a id="adapter-1"></a>

##### adapter?

> `optional` **adapter**: `ReturnType`\<[`AdapterBuilder`](globals.md#adapterbuilderadapteroptions)\>

domco adapter.

Defaults to `undefined` - creates a `func` build only.

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

---

<a id="funcmodule"></a>

### FuncModule

> **FuncModule**: `object`

Defined in: [types/index.ts:7](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L7)

Exports from the SSR `+func` entry point.

#### Type declaration

<a id="handler"></a>

##### handler

> **handler**: [`Handler`](globals.md#handler-1)

<a id="prerender"></a>

##### prerender

> **prerender**: [`Prerender`](globals.md#prerender-1)

---

<a id="handler-1"></a>

### Handler()

> **Handler**: (`req`) => [`MaybePromise`](globals.md#maybepromiset)\<`Response`\>

Defined in: [types/index.ts:24](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L24)

Request handler, takes a web request and returns a web response.

```ts
// src/server/+func.ts
import type { Handler } from "domco";

export const handler: Handler = async (req) => {
	return new Response("Hello world");
};
```

#### Parameters

##### req

`Request`

#### Returns

[`MaybePromise`](globals.md#maybepromiset)\<`Response`\>

---

<a id="maybepromiset"></a>

### MaybePromise\<T\>

> **MaybePromise**\<`T`\>: `T` \| `Promise`\<`T`\>

Defined in: [types/index.ts:4](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L4)

Helper type for a type that could be a promise.

#### Type Parameters

• **T**

---

<a id="prerender-1"></a>

### Prerender

> **Prerender**: `string`[] \| `Set`\<`string`\> \| () => [`MaybePromise`](globals.md#maybepromiset)\<`string`[] \| `Set`\<`string`\>\>

Defined in: [types/index.ts:38](https://github.com/rossrobino/domco/blob/main/packages/domco/src/types/index.ts#L38)

Paths to prerender at build time.

#### Example

```ts
// src/server/+func.ts
import type { Prerender } from "domco";

export const prerender: Prerender = ["/", "/post-1", "/post-2"];
```

## Functions

<a id="domco"></a>

### domco()

> **domco**(`domcoConfig`): `Promise`\<`Plugin`\<`any`\>[]\>

Defined in: [plugin/index.ts:30](https://github.com/rossrobino/domco/blob/main/packages/domco/src/plugin/index.ts#L30)

Creates domco Vite plugin, add to your `plugins` array within your `vite.config`
to start using domco.

#### Parameters

##### domcoConfig

[`DomcoConfig`](globals.md#domcoconfig) = `{}`

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

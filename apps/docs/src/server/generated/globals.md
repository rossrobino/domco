## Type Aliases

<a id="adapter" name="adapter"></a>

### Adapter

> **Adapter**: `object`

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

[types/public/index.ts:23](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L23)

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

[types/public/index.ts:53](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L53)

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

[types/public/index.ts:8](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L8)

---

<a id="adaptermiddleware" name="adaptermiddleware"></a>

### AdapterMiddleware

> **AdapterMiddleware**: `Connect.NextHandleFunction`

#### Defined in

[types/public/index.ts:6](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L6)

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

[types/public/index.ts:79](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L79)

---

<a id="handler" name="handler"></a>

### Handler()

> **Handler**: (`req`) => `MaybePromise`\<`Response`\>

#### Parameters

• **req**: `Request`

#### Returns

`MaybePromise`\<`Response`\>

#### Defined in

[types/public/index.ts:4](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L4)

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

[types/public/index.ts:112](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/types/public/index.ts#L112)

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

[plugin/index.ts:31](https://github.com/rossrobino/domco/blob/f721ce8a79ffda9a2b1661fc1874cde6bb508954/packages/domco/src/plugin/index.ts#L31)

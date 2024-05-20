## Type Aliases

### Block()\<D>

> **Block**\<`D`>: (`window`, `data`?) => `any`

- Import and utilize a block inside of a `Build` function
- Wrapper function to provide the `window` in other imported modules

#### Example

```ts
// src/lib/blocks/myBlock.ts
import type { Block } from "domco";

export const myBlock: Block = async ({ document }) => {
    // modify the document
}

// src/+config.ts
import { type Config, addBlocks } from "domco";
import { myBlock } from "$lib/blocks/myBlock";

export const config: Config = {
	build: async (window) => {
		await myBlock(window);

		// or alternatively if you have many blocks
		await addBlocks(window, [myBlock, ...]);
	}
};
```

#### Type parameters

• **D** = `undefined`

#### Parameters

• **window**: `DOMWindow`

• **data?**: `D`

#### Returns

`any`

#### Source

[types/index.ts:55](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/types/index.ts#L55)

---

### Build()\<P>

> **Build**\<`P`>: (`window`, `context`) => `any`

#### Type parameters

• **P** _extends_ [`Params`](/docs/modules#params-2) = [`Params`](/docs/modules#params-2)

#### Parameters

• **window**: `DOMWindow`

• **context**: [`BuildContext`](/docs/modules#buildcontextp)\<`P`\[`number`\]>

#### Returns

`any`

#### Source

[types/index.ts:3](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/types/index.ts#L3)

---

### BuildContext\<P>

> **BuildContext**\<`P`>: `object`

Context about the current page to utilize during the build.

#### Type parameters

• **P**

#### Type declaration

##### params

> **params**: `P`

The current route's parameters.

###### Example

```ts
{
	slug: "my-post";
}
```

##### route

> **route**: `string`

The route as a string, for example: `/posts/[slug]/`

#### Source

[types/index.ts:16](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/types/index.ts#L16)

---

### Config\<P>

> **Config**\<`P`>: `object`

#### Type parameters

• **P** _extends_ [`Params`](/docs/modules#params-2) = [`Params`](/docs/modules#params-2)

#### Type declaration

##### build?

> `optional` **build**: [`Build`](/docs/modules#buildp)\<`P`>

- utilized in `+config` files.
- This function runs at build time on the corresponding `.html` pages.

###### Example

```ts
// src/+config.ts
import type { Config } from "domco";

export const config: Config = {
	build: async ({ document }) => {
		// modify the contents of `./index.html`

		const p = document.createElement("p");
		p.textContent = "A server rendered paragraph.";
		document.body.appendChild(p);
	},
};
```

##### layout?

> `optional` **layout**: `string`

String of html with a <slot> to render the content into.

##### layoutBuild?

> `optional` **layoutBuild**: [`Build`](/docs/modules#buildp)\<`P`>

A `build` function that applies to the current page,
and all nested pages.

##### params?

> `optional` **params**: `P`

Provide the possible parameters for the current route.

###### Example

```ts
[{ slug: "my-post" }];
```

#### Source

[types/index.ts:69](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/types/index.ts#L69)

---

### Params

> **Params**: `ReadonlyArray`\<`Record`\<`string`, `string`>>

#### Source

[types/index.ts:67](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/types/index.ts#L67)

## Functions

### addBlocks()

> **addBlocks**(`window`, `blocks`): `Promise`\<`PromiseSettledResult`\<`any`>[]>

A helper function that runs an array of blocks asynchronously
with `Promise.allSettled`, passing the `window` and optionally
`data` into each block

#### Parameters

• **window**: `DOMWindow`

the `Window` object to be passed into each block

• **blocks**: ([`Block`](/docs/modules#blockd)\<`any`> \| `object`)[]

an array of blocks

#### Returns

`Promise`\<`PromiseSettledResult`\<`any`>[]>

an array containing the results of each block

#### Example

```ts
// src/index.build.ts
import { type Config, addBlocks } from "domco";
import { myBlock, anotherBlock } from "$lib/blocks/myBlocks";

export const config: Config = {
	build: async (window) => {
		const results = await addBlocks(window, [myBlock, anotherBlock]);
	},
};
```

#### Source

[helpers/addBlocks/index.ts:26](https://github.com/rossrobino/domco/blob/3def9bbdbe796fae4e9c231eaebe835819282561/packages/domco/helpers/addBlocks/index.ts#L26)

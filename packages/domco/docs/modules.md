

## Type Aliases

### Block

Ƭ **Block**\<`D`>: (`window`: `DOMWindow`, `data?`: `D`) => `any`

- Import and utilize a block inside of a `Build` function
- Wrapper function to provide the `window` in other imported modules

**`Example`**

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

| Name | Type |
| :------ | :------ |
| `D` | `undefined` |

#### Type declaration

▸ (`window`, `data?`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `window` | `DOMWindow` |
| `data?` | `D` |

##### Returns

`any`

#### Defined in

[types/index.ts:55](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/types/index.ts#L55)

___

### Build

Ƭ **Build**\<`P`>: (`window`: `DOMWindow`, `context`: [`BuildContext`](/docs/modules#buildcontext)\<`P`[`number`]>) => `any`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends [`Params`](/docs/modules#params) = [`Params`](/docs/modules#params) |

#### Type declaration

▸ (`window`, `context`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `window` | `DOMWindow` |
| `context` | [`BuildContext`](/docs/modules#buildcontext)\<`P`[`number`]> |

##### Returns

`any`

#### Defined in

[types/index.ts:3](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/types/index.ts#L3)

___

### BuildContext

Ƭ **BuildContext**\<`P`>: `Object`

Context about the current page to utilize during the build.

#### Type parameters

| Name |
| :------ |
| `P` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `P` | The current route's parameters. **`Example`** ```ts { slug: "my-post" } ``` |
| `route` | `string` | The route as a string, for example: `/posts/[slug]/` |

#### Defined in

[types/index.ts:16](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/types/index.ts#L16)

___

### Config

Ƭ **Config**\<`P`>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends [`Params`](/docs/modules#params) = [`Params`](/docs/modules#params) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `build?` | [`Build`](/docs/modules#build)\<`P`> | - utilized in `+config` files. - This function runs at build time on the corresponding `.html` pages. **`Example`** ```ts // src/+config.ts import type { Config } from "domco"; export const config: Config = { build: async ({ document }) => { // modify the contents of `./index.html` const p = document.createElement("p"); p.textContent = "A server rendered paragraph."; document.body.appendChild(p); } }; ``` |
| `layout?` | `string` | String of html with a <slot> to render the content into. |
| `layoutBuild?` | [`Build`](/docs/modules#build)\<`P`> | A `build` function that applies to the current page, and all nested pages. |
| `params?` | `P` | Provide the possible parameters for the current route. **`Example`** ```ts [{ slug: "my-post" }] ``` |

#### Defined in

[types/index.ts:69](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/types/index.ts#L69)

___

### Params

Ƭ **Params**: `ReadonlyArray`\<`Record`\<`string`, `string`>>

#### Defined in

[types/index.ts:67](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/types/index.ts#L67)

## Functions

### addBlocks

▸ **addBlocks**(`window`, `blocks`): `Promise`\<`PromiseSettledResult`\<`any`>[]>

A helper function that runs an array of blocks asynchronously
with `Promise.allSettled`, passing the `window` and optionally
`data` into each block

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `DOMWindow` | the `Window` object to be passed into each block |
| `blocks` | ([`Block`](/docs/modules#block)\<`any`> \| \{ `block`: [`Block`](/docs/modules#block)\<`any`> ; `data`: `any`  })[] | an array of blocks |

#### Returns

`Promise`\<`PromiseSettledResult`\<`any`>[]>

an array containing the results of each block

**`Example`**

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

#### Defined in

[helpers/addBlocks/index.ts:26](https://github.com/rossrobino/domco/blob/fd0be7bff9d3a3f5e06d1741a20d9eab79e187cb/packages/domco/helpers/addBlocks/index.ts#L26)

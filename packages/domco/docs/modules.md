

## Type Aliases

### Block

Ƭ **Block**\<`T`>: (`window`: `DOMWindow`, `data?`: `T`) => `any`

- Import and utilize a block inside of a `Build` function
- Wrapper function to provide the `window` in other imported modules

**`Example`**

```ts
// src/lib/blocks/myBlock.ts
import type { Block } from "domco";

export const myBlock: Block = async ({ document }) => {
    // modify the document
}

// src/index.build.ts
import { type Build, addBlocks } from "domco";
import { myBlock } from "$lib/blocks/myBlock";

export const build: Build = async (window) => {
    await myBlock(window);

    // or alternatively if you have many blocks
    await addBlocks(window, [myBlock, ...]);
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

#### Type declaration

▸ (`window`, `data?`): `any`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `DOMWindow` | a `Window` object representing the `./index.html` file of the `index.build` page where the function is being run |
| `data?` | `T` | data to pass into the function |

##### Returns

`any`

#### Defined in

[types/index.ts:72](https://github.com/rossrobino/domco/blob/3ce6921/packages/domco/types/index.ts#L72)

___

### Build

Ƭ **Build**\<`Params`>: (`window`: `DOMWindow`, `context`: [`BuildContext`](/docs/modules#buildcontext)\<`Params`[`number`]>) => `any`

- utilized in `index.build` or `layout.build` files.
- export a `build` function from these files to run it at build time
on the corresponding `.html` pages.

**`Example`**

```ts
// src/index.build.ts
import type { Build } from "domco";

export const build: Build = async ({ document }) => {
    // modify the contents of `./index.html`

    const p = document.createElement("p");
	   p.textContent = "A server rendered paragraph.";
    document.body.appendChild(p);
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Params` | extends `ReadonlyArray`\<`Record`\<`string`, `string`>> = `ReadonlyArray`\<`Record`\<`string`, `string`>> |

#### Type declaration

▸ (`window`, `context`): `any`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `DOMWindow` | a `Window` object representing `./index.html` |
| `context` | [`BuildContext`](/docs/modules#buildcontext)\<`Params`[`number`]> | context about the current route |

##### Returns

`any`

#### Defined in

[types/index.ts:25](https://github.com/rossrobino/domco/blob/3ce6921/packages/domco/types/index.ts#L25)

___

### BuildContext

Ƭ **BuildContext**\<`Params`>: `Object`

Context about the current page to utilize during the build

#### Type parameters

| Name |
| :------ |
| `Params` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Params` | The current route's parameters, given the file `src/posts/[slug]/index.build.ts`, `params` could be `[{ slug: "my-post" }]` |
| `route` | `string` | The route as a string, for example: `/posts/[slug]` |

#### Defined in

[types/index.ts:32](https://github.com/rossrobino/domco/blob/3ce6921/packages/domco/types/index.ts#L32)

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
import { type Build, addBlocks } from "domco";
import { myBlock, anotherBlock } from "$lib/blocks/myBlocks";

export const build: Build = async (window) => {
    const results = await addBlocks(window, [myBlock, anotherBlock]);
}
```

#### Defined in

[helpers/addBlocks/index.ts:24](https://github.com/rossrobino/domco/blob/3ce6921/packages/domco/helpers/addBlocks/index.ts#L24)

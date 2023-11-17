

## Type Aliases

### Block

Ƭ **Block**\<`T`>: (`window`: `Window` & typeof `globalThis`, `data?`: `T`) => `Promise`\<`any`>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

#### Type declaration

▸ (`window`, `data?`): `Promise`\<`any`>

- Import and utilize a block inside of a `Build` function
- Wrapper function to provide the `window` in other imported modules

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `Window` & typeof `globalThis` | a `Window` object representing the `./index.html` file of the `index.build` page where the function is being run |
| `data?` | `T` | data to pass into the function |

##### Returns

`Promise`\<`any`>

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

#### Defined in

[types/index.ts:72](https://github.com/rossrobino/domco/blob/4eaa737/packages/domco/types/index.ts#L72)

___

### Build

Ƭ **Build**\<`Params`>: (`window`: `Window` & typeof `globalThis`, `context`: [`BuildContext`](/docs/modules#buildcontext)\<`Params`[`number`]>) => `Promise`\<`any`>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Params` | extends `ReadonlyArray`\<`Record`\<`string`, `string`>> = `ReadonlyArray`\<`Record`\<`string`, `string`>> |

#### Type declaration

▸ (`window`, `context`): `Promise`\<`any`>

- utilized in `index.build` or `layout.build` files.
- export a `build` function from these files to run it at build time
on the corresponding `.html` pages.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `Window` & typeof `globalThis` | a `Window` object representing `./index.html` |
| `context` | [`BuildContext`](/docs/modules#buildcontext)\<`Params`[`number`]> | context about the current route |

##### Returns

`Promise`\<`any`>

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

#### Defined in

[types/index.ts:23](https://github.com/rossrobino/domco/blob/4eaa737/packages/domco/types/index.ts#L23)

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

[types/index.ts:33](https://github.com/rossrobino/domco/blob/4eaa737/packages/domco/types/index.ts#L33)

## Functions

### addBlocks

▸ **addBlocks**(`window`, `blocks`): `Promise`\<`PromiseSettledResult`\<`any`>[]>

A helper function that runs an array of blocks asynchronously
with `Promise.allSettled`, passing the `window` and optionally
`data` into each block

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `window` | `Window` & typeof `globalThis` | the `Window` object to be passed into each block |
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

[helpers/addBlocks/index.ts:23](https://github.com/rossrobino/domco/blob/4eaa737/packages/domco/helpers/addBlocks/index.ts#L23)

___

### prefetch

▸ **prefetch**(`options?`): `void`

Use on the client to prefetch/prerender the content for link tags
on the current page.

Can also be used more than once with different options for different selectors.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | prefetch options |
| `options.event?` | ``"hover"`` \| ``"load"`` \| ``"visible"`` | Determines when the prefetch takes place, defaults to `"hover"`. - `"hover"` - after mouseover or focus for > 200ms - `"visible"` - within viewport - `"load"` - when script is loaded, use carefully |
| `options.prerender?` | `boolean` | Uses the experimental Speculation Rules API when supported to prerender on the client, defaults to `false`. Browsers that do not support will still use `<link rel="prefetch">` instead. [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) |
| `options.selector?` | `string` | css selector for the anchor elements, defaults to elements that start with "/" `"a[href^='/']"`. For example, set to `"a[href^='/posts']"` to apply only to routes that begin with "/posts", or use another attribute entirely. |

#### Returns

`void`

**`Example`**

```js
import { prefetch } from "domco";

prefetch({ prerender: true });
```

#### Defined in

[helpers/prefetch/index.ts:28](https://github.com/rossrobino/domco/blob/4eaa737/packages/domco/helpers/prefetch/index.ts#L28)

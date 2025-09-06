# @domcojs/vercel

## 3.0.2

### Patch Changes

- 28ed323: fix: undo Vercel adapter changes in `v3.0.1` due to issue supporting `AsyncLocalStorage` when using the `fetch` export.

## 3.0.1

### Patch Changes

- aeb8817: This change enables the use of [default fetch export](https://vercel.com/docs/functions/functions-api-reference?framework=other&language=ts#fetch-web-standard) for Vercel adapter. The function no longer requires the use of domco's `nodeListener` in production code to convert the user's web standard handler into a Node compatible handler---Vercel server bundles will be a bit smaller now.

## 3.0.0

### Major Changes

- 54cfe1a: breaking: Remove support for `edge` runtime.

  Removes edge runtime option, Vercel [recommends to use Node](https://vercel.com/docs/functions/runtimes/edge):

  > We recommend migrating from edge to Node.js for improved performance and reliability. Both runtimes run on [Fluid compute](https://vercel.com/docs/fluid-compute) with [Active CPU pricing](https://vercel.com/docs/fluid-compute/pricing).

## 2.0.2

### Patch Changes

- 7be5824: chore: Publish declaration maps and source for TypeScript go to definition.

## 2.0.1

### Patch Changes

- e443709: fix: isr request creation

## 2.0.0

### Major Changes

- 9c86ff0: Reflect major changes in `domco`.

### Patch Changes

- Updated dependencies [9c86ff0]
- Updated dependencies [9c86ff0]
  - domco@4.0.0

## 1.1.1

### Patch Changes

- 448e023: fix: allow other node versions, bump default to 22

## 1.1.0

### Minor Changes

- 832e25b: feat: add `trailingSlash` option to adapter config

  With this option, users will not have to set this value in a `vercel.json`.

  see - https://vercel.com/docs/projects/project-configuration#trailingslash

## 1.0.2

### Patch Changes

- 5aaa6ce: fix: allow pathname query when user sets a different pathname

## 1.0.1

### Patch Changes

- 67a9726: fix: isr import

## 1.0.0

### Major Changes

- 51ccc90: Creates separate adapter packages for each adapter. These changes reduces the size of the core package and ensures users only install what is needed.

  If you are using an adapter, install the corresponding package `@domcojs/...`. For example, to install the Vercel adapter and update the import statements in your `vite.config` file:

  ```bash
  npm i -D @domcojs/vercel
  ```

  ```diff
  - import { adapter } from "domco/adapter/vercel";
  + import { adapter } from "@domcojs/vercel";
  ```

### Patch Changes

- Updated dependencies [51ccc90]
- Updated dependencies [1611dc5]
  - domco@3.0.0

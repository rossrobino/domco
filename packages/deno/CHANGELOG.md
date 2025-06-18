# @domcojs/deno

## 2.0.1

### Patch Changes

- 7be5824: chore: Publish declaration maps and source for TypeScript go to definition.

## 2.0.0

### Major Changes

- 9c86ff0: Reflect major changes in `domco`.

### Patch Changes

- Updated dependencies [9c86ff0]
- Updated dependencies [9c86ff0]
  - domco@4.0.0

## 1.0.1

### Patch Changes

- 15a6723: dep: bump @std/http
- Updated dependencies [4f30877]
  - domco@3.0.2

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

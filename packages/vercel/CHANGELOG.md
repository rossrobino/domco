# @domcojs/vercel

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

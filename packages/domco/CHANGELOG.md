# domco

## 0.7.0

### Minor Changes

- dea2596: Removes node default build, adds node adapter instead.

  ```js
  import { adapter } from "domco/adapter/node";
  ```

- 66bd2f8: Adds bun adapter

### Patch Changes

- da8740b: Use `configureServer` and add `vite preview` script instead of running node.
- 7370e01: import `process` from "node:process" instead of global
- 7370e01: exports `createAppDev` from "domco/app/dev"

## 0.6.3

### Patch Changes

- 41af98a: Bump dependencies

## 0.6.2

### Patch Changes

- 78a62e5: fix logging output for prerendering /index.html
- 78a62e5: throw error for 404 during prerendering

## 0.6.1

### Patch Changes

- fix: throw errors if prerender paths do not start with /

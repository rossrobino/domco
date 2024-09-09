# domco

## 0.11.0

### Minor Changes

- aa4e711: Adds the ability paths to `CreateAppMiddleware`.

  - This is breaking if you are using a custom setup and passing middleware into `createApp`, you now need to specify the `path` in addition to the `handler` passed in. [See example here](https://domco.robino.dev/deploy#example)

## 0.10.0

### Minor Changes

- 07901b2: Adds request listener in place of `@hono/node-server`.

  - This change removes the last remaining dependency for the project other than `vite` and `hono`.
  - Removes `serveStatic` option for `createApp`, use `middleware` instead, see [example](https://domco.robino.dev/deploy#example).

## 0.9.1

### Patch Changes

- 01cdb56: Adds image optimization support for vercel adapter

## 0.9.0

### Minor Changes

- 0f66169: Adds cloudflare adapter.

## 0.8.1

### Patch Changes

- ec46a54: Removes `esbuild` from deps. Dependencies are now bundled during SSR build by default to be compatible with `"webworker"` target.
- ec46a54: stop using node:util `styleText` because it doesn't work in Bun yet, still experimental. Moves engines back to node 20.

## 0.8.0

### Minor Changes

- 418af75: remove node/bun adapter, better to let user configure.
- f9e5cd4: add supported node versions `>= 20.12.0`

### Patch Changes

- 418af75: Remove defu dependency, only used in a couple places where Object.assign works instead
- f9e5cd4: Replace picocolors with built in node `styleText`

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

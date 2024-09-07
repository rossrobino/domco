# create-domco

## 0.1.11

### Patch Changes

- 07901b2: Adds request listener in place of `@hono/node-server`.

  - This change removes the last remaining dependency for the project other than `vite` and `hono`.
  - Removes `serveStatic` option for `createApp`, use `middleware` instead, see [example](https://domco.robino.dev/deploy#example).

## 0.1.10

### Patch Changes

- 01cdb56: Adds image optimization support for vercel adapter

## 0.1.9

### Patch Changes

- 0f66169: Adds cloudflare adapter.

## 0.1.8

### Patch Changes

- 0c243a9: Update template with links in html
- a1e0bf8: bump domco version

## 0.1.7

### Patch Changes

- 418af75: Bump dependency versions

## 0.1.6

### Patch Changes

- da8740b: Use `configureServer` and add `vite preview` script instead of running node.
- a84c848: bump domco in template
- 7370e01: import `process` from "node:process" instead of global

## 0.1.5

### Patch Changes

- 41af98a: Bump dependencies
- 5a4e83e: adds `check` script to template

## 0.1.4

### Patch Changes

- 6832fa6: Bump template dependencies

## 0.1.3

### Patch Changes

- 07e1095: Update tsconfig defaults

# create-domco

## 4.0.1

### Patch Changes

- c137d0b: fix: tailwind source no longer required - auto detected

## 4.0.0

### Major Changes

- bde8959: bump to be the same major as domco, fix adapter versions

## 3.0.0

### Major Changes

- 9c86ff0: Reflect major changes in `domco`.
- 9c86ff0: Remove `deno.json` config since deno supports `package.json`.

### Minor Changes

- 9c86ff0: feat: Add server frameworks - `hono` and `ovr`.

### Patch Changes

- Updated dependencies [9c86ff0]
- Updated dependencies [9c86ff0]
  - domco@4.0.0

## 2.1.0

### Minor Changes

- 8ad35b8: feat: add adapter from the create script

### Patch Changes

- edb07ce: informative warning if directory is not empty

## 2.0.20

### Patch Changes

- 2cf8615: update func template, update template dependencies
- Updated dependencies [4f30877]
  - domco@3.0.2

## 2.0.19

### Patch Changes

- 3d80cd6: fix: tailwind v4 setup - source identification during build requires source to be set

## 2.0.18

### Patch Changes

- Updated dependencies [51ccc90]
- Updated dependencies [1611dc5]
  - domco@3.0.0

## 2.0.17

### Patch Changes

- 9767187: fix: actually push the fix!

## 2.0.16

### Patch Changes

- 48ffdbc: fix: prettier tsconfig error, adds better error handling

## 2.0.15

### Patch Changes

- 4ad341f: include vite/prettier configs in tsconfig

## 2.0.14

### Patch Changes

- 7ab1dd4: update to tailwindcss v4
- e110f06: css - light dark color-scheme

## 2.0.13

### Patch Changes

- fe6d39e: Update dependencies
- Updated dependencies [8428e9a]
  - domco@2.3.0

## 2.0.12

### Patch Changes

- ef5ff15: Vite 6 maintenance

  - Fixes auto-reload for SSR only HTML responses - see [issue](https://github.com/vitejs/vite/issues/19114)
  - `create-domco` template defaults to use v6.
  - Updates project dependencies

## 2.0.11

### Patch Changes

- 9a0295c: bump domco version

## 2.0.10

### Patch Changes

- 002ca9a: update deno template, `mjs/mts` vite config no longer required
- Updated dependencies [9605fe3]
  - domco@2.1.5

## 2.0.9

### Patch Changes

- 8c59699: `prerender` export can now be a `Set` in addition to being an `Array`
- Updated dependencies [8c59699]
  - domco@2.1.4

## 2.0.8

### Patch Changes

- 185c105: show warning if the target directory exists and is not empty

## 2.0.7

### Patch Changes

- 98b5ecd: update template for deno 2.0

## 2.0.6

### Patch Changes

- 0b2ee01: fix package.json formatting

## 2.0.5

### Patch Changes

- e899065: fetch latest version of domco from npm

## 2.0.4

### Patch Changes

- e783a67: clean up empty directories after prerendering

## 2.0.3

### Patch Changes

- 3ac7c4b: Adds support for prerendering any file instead of just `html`. See [docs](https://domco.robino.dev/tutorial#prerender)

## 2.0.2

### Patch Changes

- a6c55c9: removes react jsx default from tsconfig
- d5d4e35: format template files with prettier before writing

## 2.0.1

### Patch Changes

- 557722d: bump versions

## 2.0.0

### Major Changes

- 371d3f7: Renames `+app` to `+func`

  If you are using a UI framework with domco it's nice to have an `app` directory that can be imported on the server and client that holds the components of your application. Having the server entry point named `+app` made the function of the module less clear. This change renames the `+app` entry point to `+func`. There are no other breaking changes.

### Patch Changes

- e679eed: fix: prettier config formatting

## 1.0.0

### Major Changes

- 344d88a: v1.0.0

  ## Stable API

  Settled on an API and scope for the project.

  domco follows semantic versioning, so there will no longer be breaking changes between minor versions now that the project is v1.

  ## Breaking changes

  None from v0.13, if upgrading from a lower version [see the changelog](https://github.com/rossrobino/domco/blob/main/packages/domco/CHANGELOG.md) or consult the [documentation](https://domco.robino.dev) for details.

## 0.2.1

### Patch Changes

- 8a99276: use project name for title and header

## 0.2.0

### Minor Changes

- a5f23e7: Updates template to 0.13

## 0.1.14

### Patch Changes

- d52d692: add `deno` as a pm -- detects and outputs deno project template

## 0.1.13

### Patch Changes

- aa4e711: Adds the ability paths to `CreateAppMiddleware`.

  - This is breaking if you are using a custom setup and passing middleware into `createApp`, you now need to specify the `path` in addition to the `handler` passed in. [See example here](https://domco.robino.dev/deploy#example)

## 0.1.12

### Patch Changes

- bc29d39: rm server and client from starter template

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

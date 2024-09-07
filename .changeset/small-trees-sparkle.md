---
"domco": minor
"create-domco": patch
---

Adds request listener in place of `@hono/node-server`.

- This change removes the last remaining dependency for the project other than `vite` and `hono`.
- Removes `serveStatic` option for `createApp`, use `middleware` instead, see [example](https://domco.robino.dev/deploy#example).

---
"@domcojs/cloudflare": major
---

Pass the client's IP address to `fetch` as `info.ip`, from Cloudflare's `CF-Connecting-IP` header. `fetch` now receives `(req, info, env, ctx)`: Cloudflare's `env` and `ctx` move from the second and third arguments to the third and fourth. Update a handler written as `fetch(req, env, ctx)` to `fetch(req, info, env, ctx)`.

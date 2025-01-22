---
"domco": major
"@domcojs/cloudflare": major
"@domcojs/deno": major
"@domcojs/vercel": major
---

Creates separate adapter packages for each adapter. These changes reduces the size of the core package and ensures users only install what is needed.

If you are using an adapter, install the corresponding package `@domcojs/...`. For example, to install the Vercel adapter and update the import statements in your `vite.config` file:

```bash
npm i -D @domcojs/vercel
```

```diff
- import { adapter } from "domco/adapter/vercel";
+ import { adapter } from "@domcojs/vercel";
```

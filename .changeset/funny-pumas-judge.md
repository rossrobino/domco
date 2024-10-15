---
"domco": patch
---

`prerender` export can now be a function that returns an array or set of paths to prerender like in react-router v7. This makes it easier to prerender programmatically without having to create another function.

```ts
// src/server/+func.ts
import type { Prerender } from "domco";

// prerender can still be a value, for example:
export const prerender: Prerender = ["/prerender"];
export const prerender: Prerender = new Set(["/prerender"]);

// now prerender can also be a function, for example:
export const prerender: Prerender = () => ["/prerender"];
export const prerender: Prerender = async () => new Set(["/prerender"]);
```

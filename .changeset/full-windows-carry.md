---
"domco": minor
---

feat: Add additional manifest information to `client:page` and `client:script` virtual modules.

### Page chunk

In addition to the transformed `html`, you can now import the `chunk` information for the linked JS entry point to a page.

```ts
import { chunk } from "client:page";

chunk.src; // manifest information for the linked assets
chunk.tags; // resource tags (already inside the `html`)
```

This holds the same data `client:script` provides but for the HTML entry:

```ts
import { src, tags } from "client:script";
```

### Additional source properties

`chunk.src` now contains additional properties:

- `src`: Source file path
- `file`: Final hashed file path (same as `src.module[0]`)
- `assets`: For example, a font path you can use to add a `preload` link
- `dynamic`: Nested `Chunk[]` that contains the same information for each dynamic import

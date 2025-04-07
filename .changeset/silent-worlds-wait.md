---
"domco": minor
---

feat: export `src` paths from `client:script` module

If you don't need the entire HTML tag string and would like to just get the paths for a client js entry point, you can now import the `src` and get correct asset paths in development and production.

```ts
import { src } from "client:script";

// The following contain the `src` paths for each of the resources
// required for the entry script.
src.modules;
src.preload;
src.styles;
```

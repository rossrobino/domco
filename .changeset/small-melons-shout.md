---
"domco": patch
---

Removes `esbuild` from deps. Dependencies are now bundled during SSR build by default to be compatible with `"webworker"` target.

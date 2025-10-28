---
"domco": minor
---

feat: Emit and handle server assets.

domco now sets Vite [`config.build.emitAssets`](https://vite.dev/config/build-options.html#build-emitassets) to `true` by default, and will copy the emitted assets during the `ssr` build `dist/client/_immutable` to serve.

If you have set `emitAssets` to `true` in your projects Vite config separately, it can now be removed. You no longer need to serve the separate assets directory for ssr in addition to `dist/client/_immutable`. All assets should now be contained in `dist/client/_immutable` regardless of the build they are utilized in.

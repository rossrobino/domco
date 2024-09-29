---
"domco": patch
---

Use `name` in the output filename instead of as a directory for easier debugging in production dev tools. Now the name will show up in the network tab instead of just the hash.

Example:

`dist/client/_immutable/name/hash.js` is now `dist/client/_immutable/name.hash.js`

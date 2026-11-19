---
"@domcojs/vercel": patch
---

`trailingSlash: false` now redirects paths that end with a slash to the same path without it, as documented. Before, the option was ignored. ISR builds no longer add `__pathname` to the `allowQuery` array passed in the options, so running the build again doesn't add it twice.

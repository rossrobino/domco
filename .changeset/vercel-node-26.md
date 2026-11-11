---
"@domcojs/vercel": minor
---

Default to the `nodejs26.x` runtime, the latest Node.js LTS on Vercel. Node.js 24 lacks newer APIs such as `Uint8Array.prototype.toBase64`. Set `config.runtime` to `"nodejs24.x"` to keep the previous runtime.

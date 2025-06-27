---
"@domcojs/vercel": major
---

breaking: Remove support for `edge` runtime.

Removes edge runtime option, Vercel [recommends to use Node](https://vercel.com/docs/functions/runtimes/edge):

> We recommend migrating from edge to Node.js for improved performance and reliability. Both runtimes run on [Fluid compute](https://vercel.com/docs/fluid-compute) with [Active CPU pricing](https://vercel.com/docs/fluid-compute/pricing).

---
"@domcojs/vercel": patch
"domco": patch
---

patch: Optional adapter entry - adapters can now pass `null` as the entry to use default `/dist/server/app.js` build as the entry point.

This change enables the use of [default fetch export](https://vercel.com/docs/functions/functions-api-reference?framework=other&language=ts#fetch-web-standard) for Vercel adapter. The function no longer requires the use of domco's `nodeListener` in production code to convert the user's web standard handler into a Node compatible handler---Vercel server bundles will be a bit smaller now.

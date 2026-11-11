---
"domco": minor
---

Pass the client's IP address to `fetch` as the second argument, `{ ip?: string }`, exported as the `FetchInfo` type. The IP is never read from a header the client can set: the dev and preview servers and `nodeListener` pass the socket's remote address. Behind a proxy you trust, set the new `ipHeader` option of `nodeListener` to the header the proxy sets, and the last address in it is used.

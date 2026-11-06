---
"@domcojs/vercel": patch
---

Use the client's protocol in request URLs. Vercel ends TLS at its edge and forwards plain HTTP to the function, so request URLs started with `http://`. The Node, ISR, and Bun entries now take the protocol from the `X-Forwarded-Proto` header that Vercel sets.

Fix two bugs in the ISR entry: requests with a body such as `POST` failed because Node requires `duplex: "half"` for a streamed body, and the internal `__pathname` query param was left in the request URL.

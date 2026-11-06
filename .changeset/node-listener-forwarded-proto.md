---
"domco": minor
---

Add a `trustForwardedProto` option to `nodeListener`. When enabled, the `Request` URL uses the protocol from the `X-Forwarded-Proto` header, for apps behind a trusted proxy that ends TLS. By default the header is ignored and the protocol still comes from the socket.

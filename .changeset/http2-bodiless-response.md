---
"domco": patch
---

fix: `nodeListener` no longer resets HTTP/2 responses before their headers are sent

Since 5.2.1, a bodiless response returned without awaiting anything, such as a redirect from a GET, reached HTTP/2 clients as a reset stream with no response. `nodeListener` now closes the stream only after the response has been sent, as Node does, and only when the client may still be sending a request body.

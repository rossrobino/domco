---
"domco": patch
---

fix: `nodeListener` no longer passes the status message to HTTP/2 responses

HTTP/2 has no status message, and Node logged "UnsupportedWarning: Status message is not supported by HTTP/2" when one was passed.

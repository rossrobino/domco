---
"domco": patch
---

Harden the Node listener request and response lifecycle by aborting disconnected requests, rejecting interrupted body reads, skipping response streams for `HEAD` requests, and routing conversion failures through the listener error handling.

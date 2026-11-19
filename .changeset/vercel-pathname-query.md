---
"@domcojs/vercel": patch
---

Stop adding `__pathname` to the request URL when ISR is off. The route to the function only adds it with ISR, and the Bun entry now moves it back into the pathname with ISR too.

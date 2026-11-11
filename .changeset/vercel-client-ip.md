---
"@domcojs/vercel": minor
---

Pass the client's IP address to `fetch` as `info.ip` in the Node.js, Node.js with ISR, and Bun entries. The IP comes from the `x-forwarded-for` header, which Vercel overwrites at its edge to prevent spoofing.

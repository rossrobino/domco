---
"domco": patch
---

fix: `nodeListener` finishes HTTP/2 responses when the request body is left unread

With Node's HTTP/2 compatibility API, such as Vite's HTTPS dev server or `http2.createSecureServer(nodeListener(app.fetch))`, a response sent before the app read the whole request body, for example a `413` decided from `Content-Length`, never finished. The client kept the stream open waiting to finish its upload. Once the response is complete, `nodeListener` now closes the stream with `NO_ERROR`, which tells the client to stop sending the body.

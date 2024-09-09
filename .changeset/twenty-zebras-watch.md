---
"domco": minor
"create-domco": patch
---

Adds the ability paths to `CreateAppMiddleware`.

- This is breaking if you are using a custom setup and passing middleware into `createApp`, you now need to specify the `path` in addition to the `handler` passed in. [See example here](https://domco.robino.dev/deploy#example)

---
"create-domco": major
"domco": major
---

Renames `+app` to `+func`

If you are using a UI framework with domco it's nice to have an `app` directory that can be imported on the server and client that holds the components of your application. Having the server entry point named `+app` made the function of the module less clear. This change renames the `+app` entry point to `+func`. There are no other breaking changes.

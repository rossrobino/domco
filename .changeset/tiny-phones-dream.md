---
"domco": major
---

Moves `Injector` to a separate package - `@robino/html`

This change reduces the size of the core package, not all users need this helper.

If you are using the `Injector` class, install the `@robino/html` package and update your import statements accordingly.

```bash
npm i @robino/html
```

```diff
- import { Injector } from "domco/injector";
+ import { Injector } from "@robino/html";
```

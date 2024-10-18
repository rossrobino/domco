---
"domco": minor
---

HTML `Injector`

Easily manipulate HTML on the server with the `Injector` helper.

- Stabilizes the HTML `Injector` helper
- Adds `Injector` tests

```ts
import { Injector } from "domco/injector";

const injector = new Injector(
	`<!doctype html><html><body><!-- comment --></body></html>`,
);

injector
	// Set or change the title
	.title("My Title")
	// pass a TagDescriptor
	.head([{ name: "script", attrs: { type: "module", src: "./script.js" } }])
	// pass a string of text
	.body("Prepended to the body! ", "prepend")
	// replace comments
	.comment("comment", "My comment")
	// stringify HTML
	.toString();
```

Produces the following HTML.

```html
<!doctype html>
<html>
	<head>
		<title>My Title</title>
		<script type="module" src="./script.js"></script>
	</head>
	<body>
		Prepended to the body! My comment
	</body>
</html>
```

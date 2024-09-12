import type { GetTemplateFile } from "../index.js";
import { faviconFileName } from "./favicon.js";
import { styleFileName } from "./style-css.js";

const getTemplateFiles: GetTemplateFile = () => {
	return [
		{
			name: "src/+page.html",
			contents: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/${faviconFileName}" />
		<link rel="stylesheet" href="/${styleFileName}" />
		<title>Title</title>
		<meta name="description" content="Description" />
	</head>
	<body>
		<header></header>
		<main>
			<h1>Hello World</h1>
			<ul>
				<li><a href="https://vitejs.dev">Vite</a></li>
				<li><a href="https://hono.dev">Hono</a></li>
				<li><a href="https://domco.robino.dev">domco</a></li>
			</ul>
		</main>
		<footer></footer>
	</body>
</html>
`,
		},
	];
};

export default getTemplateFiles;

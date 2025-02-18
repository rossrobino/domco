import type { GetTemplateFile } from "../index.js";
import { faviconFileName } from "./favicon.js";
import { styleFileName } from "./style-css.js";

const getTemplateFiles: GetTemplateFile = ({ tailwind, projectName }) => {
	return [
		{
			name: "src/client/+page.html",
			content: `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/${faviconFileName}" />
		<link rel="stylesheet" href="/${tailwind ? styleFileName.tailwind : styleFileName.base}" />
		<title>${projectName}</title>
		<meta name="description" content="${projectName}" />
	</head>
	<body>
		<header></header>
		<main>
			<h1${tailwind ? ` class="text-3xl"` : ""}>${projectName}</h1>
			<ul>
				<li><a${tailwind ? ` class="underline"` : ""} href="https://vitejs.dev">Vite</a></li>
				<li><a${tailwind ? ` class="underline"` : ""} href="https://domco.robino.dev">domco</a></li>
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

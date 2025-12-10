import type { GetTemplateFile, GetTemplateFileOptions } from "../index.js";
import { faviconFileName } from "./favicon.js";
import { styleFileName } from "./style-css.js";

export const htmlTemplate = ({
	projectName,
	tailwind,
	framework,
}: GetTemplateFileOptions) => {
	const mono = framework === "mono-jsx";
	const ovr = framework === "ovr";

	return `${mono || ovr ? "" : "<!doctype html>"}
<html lang="en">
	<head>
		<meta char${mono ? "S" : "s"}et="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="/${faviconFileName}" />
		${mono ? `{html(tags)}` : ovr ? `{Render.html(tags)}` : `<link rel="stylesheet" href="/${tailwind ? styleFileName.tailwind : styleFileName.base}" />`}
		<title>${projectName}</title>
	</head>
	<body>
		<h1${tailwind ? ` class="text-3xl"` : ""}>${projectName}</h1>
		<ul>
			<li><a${tailwind ? ` class="underline"` : ""} href="https://vitejs.dev">Vite docs</a></li>
			<li><a${tailwind ? ` class="underline"` : ""} href="https://domco.robino.dev">domco docs</a></li>
		</ul>
	</body>
</html>
`;
};

const getTemplateFiles: GetTemplateFile = (options) => {
	const { lang, tailwind, framework } = options;

	return [
		framework !== "mono-jsx" && framework !== "ovr"
			? { name: "src/client/+page.html", content: htmlTemplate(options) }
			: {
					name: "src/client/+script." + lang,
					content: `import "@/${tailwind ? styleFileName.tailwind : styleFileName.base}"`,
				},
	];
};

export default getTemplateFiles;

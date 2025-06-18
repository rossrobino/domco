import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, framework, tailwind }) => {
	const isTs = lang === "ts";

	if (framework === "ovr") lang += "x"; // jsx || tsx

	let content = `import { html } from "client:page";`;
	if (framework === "ovr") {
		content += `\nimport { App, Page } from "ovr";

const app = new App();

app.base = html;

const page = new Page("/", () => {
	return (
		<a href="https://ovr.robino.dev"${tailwind ? ` class="underline"` : ""}>
			ovr docs
		</a>
	);
});

app.add(page);

export default app;
`;
	} else if (framework === "hono") {
		content += `\nimport { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export default app;
`;
	} else {
		content += `\n\nexport default {
	fetch(req${isTs ? ": Request" : ""}) {
		const url = new URL(req.url);

		if (url.pathname === "/") {
			return new Response(html, { headers: { "content-type": "text/html" } });
		}

		return new Response("Not found", { status: 404 });
	}
}
`;
	}

	return [{ name: `src/server/+app.${lang}`, content }];
};

export default getTemplateFiles;

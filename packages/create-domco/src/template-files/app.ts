import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang, framework }) => {
	const isTs = lang === "ts";

	let content = `import { html } from "client:page";`;
	if (framework === "ovr") {
		content += `\nimport { Router } from "ovr";

const app = new Router();

app.get("/", (c) => c.html(html));

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
			return new Response(html, {
				headers: {
					"content-type": "text/html",
				},
			});
		}

		return new Response("Not found", { status: 404 });
	}
}
`;
	}

	return [{ name: `src/server/+app.${lang}`, content }];
};

export default getTemplateFiles;

import type { GetTemplateFile } from "../index.js";
import { htmlTemplate } from "./entry.js";

const getTemplateFiles: GetTemplateFile = (options) => {
	let { lang, framework, tailwind } = options;

	const isTs = lang === "ts";

	if (framework === "ovr" || framework === "mono-jsx") lang += "x"; // jsx || tsx

	let content: string;

	if (framework === "ovr") {
		content = `import { html } from "client:page";
import { App, Get } from "ovr";

const app = new App();

app.base = html;

const page = new Get("/", () => {
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
		content = `import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export default app;
`;
	} else if (framework === "mono-jsx") {
		content = `import { tags } from "client:script";

export default {
	fetch() {
		return (
			${htmlTemplate(options)}
		);
	},
};
`;
	} else {
		content = `import { html } from "client:page";

export default {${isTs ? "" : `\n\t/** @param {Request} req */`}
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

import type { GetTemplateFile } from "../index.js";
import { htmlTemplate } from "./entry.js";

const getTemplateFiles: GetTemplateFile = (options) => {
	let { lang, framework } = options;

	const isTs = lang === "ts";

	if (framework === "ovr" || framework === "mono-jsx") lang += "x"; // jsx || tsx

	let content: string;

	if (framework === "ovr") {
		content = `import { tags } from "client:script";
import { App, Render, Route } from "ovr";

const app = new App();

const page = Route.get("/", () => {
	return (
		${htmlTemplate(options)}
	);
});

app.use(page);

export default app;
`;
	} else if (framework === "hono") {
		content = `import { html } from "client:page";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html(html));

export default app;
`;
	} else if (framework === "h3") {
		content = `import { html } from "client:page";
import { H3 } from "h3";

const app = new H3();

app.get("/", () => html);

export default app;
`;
	} else if (framework === "elysia") {
		content = `import * as page from "client:page";
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";

const app = new Elysia();

app.use(html()).get("/", () => page.html);

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
	} else if (framework === "remix") {
		content = `import { createRouter, createRoutes, html } from "@remix-run/fetch-router";
import * as page from "client:page";

const routes = createRoutes({ home: "/" });

const router = createRouter();

router.get(routes.home, () => html(page.html));

export default router;
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

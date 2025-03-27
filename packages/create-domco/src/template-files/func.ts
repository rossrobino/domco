import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang }) => {
	const isTs = lang === "ts";
	return [
		{
			name: `src/server/+func.${lang}`,
			content: `import { html } from "client:page";

export default {
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
`,
		},
	];
};

export default getTemplateFiles;

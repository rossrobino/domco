import type { GetTemplateFile } from "../index.js";

const getTemplateFiles: GetTemplateFile = ({ lang }) => {
	const isTs = lang === "ts";
	return [
		{
			name: `src/server/+func.${lang}`,
			contents: `${isTs ? `import type { Handler } from "domco";` : `/** @import { Handler } from "domco" */`}
import { html } from "client:page";
${isTs ? "" : "\n/** @type {Handler} */"}
export const handler${isTs ? ": Handler" : ""} = async (req) => {
	const { pathname } = new URL(req.url);

	if (pathname === "/") {
		return new Response(html, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	}

	return new Response("Not found", { status: 404 });
};
`,
		},
	];
};

export default getTemplateFiles;

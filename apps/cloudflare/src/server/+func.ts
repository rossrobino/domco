import { html } from "client:page";

export default {
	fetch(req: Request) {
		const { pathname } = new URL(req.url);

		if (pathname === "/") {
			return new Response(html, {
				headers: {
					"content-type": "text/html",
				},
			});
		}

		return new Response("Not found", { status: 404 });
	},
};

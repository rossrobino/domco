import type { ServerHook } from "vite";

export const configureServer: ServerHook = (server) => {
	server.watcher.add(process.cwd()); // instead of `root`
	server.watcher.on("change", (file) => {
		if (file.endsWith(".md")) {
			server.ws.send({
				type: "full-reload",
			});
		}
	});
	// fixes trailing slash for dev server
	// https://github.com/vitejs/vite/issues/6596
	server.middlewares.use((req, _, next) => {
		if (!req.url) {
			return next();
		}
		const requestURL = new URL(req.url, `http://${req.headers.host}`);
		if (/^\/(?:[^@]+\/)*[^@./]+$/g.test(requestURL.pathname)) {
			requestURL.pathname += "/";
			req.url = requestURL.toString();
		}
		return next();
	});
};
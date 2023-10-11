import type { ServerHook } from "vite";

export const configureServer = (options: {
	entryPoints: Record<string, string>;
}) => {
	const { entryPoints } = options;

	const serverHook: ServerHook = (server) => {
		server.watcher.add(process.cwd()); // instead of `root`
		server.watcher.on("change", (file) => {
			const fullReload = /(.*)(\.(build.js|build.ts|md|txt|json))$/;
			if (fullReload.test(file)) {
				server.ws.send({
					type: "full-reload",
				});
			}
		});
		server.middlewares.use((req, _, next) => {
			if (!req.url) return next();
			const requestURL = new URL(req.url, `http://${req.headers.host}`);
			// remove the empty strings since `dynPath` will not have those
			const reqSegments = requestURL.pathname
				.split("/")
				.filter((v) => v !== "");
			const actualPaths = Object.keys(entryPoints);
			// ones that have "[" will be dynamic
			const dynPaths = actualPaths.filter((v) => v.includes("["));
			for (const dynPath of dynPaths) {
				const dynSegments = dynPath.split("/");
				if (dynSegments.length === reqSegments.length) {
					// the paths are the same length, try to process
					for (let i = 0; i < reqSegments.length; i++) {
						const reqSegment = reqSegments[i];
						const dynSegment = dynSegments[i];
						if (reqSegment === dynSegment) {
							// segments match, go to next
							continue;
						} else if (dynSegment?.startsWith("[")) {
							// segment is dynamic, correct to the actual
							reqSegments[i] = dynSegment;
							requestURL.pathname = "/" + reqSegments.join("/");
							req.url = requestURL.toString();
						} else {
							// segments do not match and are not dynamic, stop checking
							break;
						}
					}
				}
			}
			return next();
		});
		// fixes trailing slash for dev server
		// https://github.com/vitejs/vite/issues/6596
		server.middlewares.use((req, _, next) => {
			if (!req.url) return next();
			const requestURL = new URL(req.url, `http://${req.headers.host}`);
			if (/^\/(?:[^@]+\/)*[^@./]+$/g.test(requestURL.pathname)) {
				requestURL.pathname += "/";
				req.url = requestURL.toString();
			}
			return next();
		});
	};
	return serverHook;
};

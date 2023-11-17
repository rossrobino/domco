import path from "node:path";
import type { ServerHook } from "vite";

export const configureServer = (options: {
	entryPoints: Record<string, string>;
}) => {
	const { entryPoints } = options;

	const serverHook: ServerHook = (server) => {
		const sendFullReload = () => server.ws.send({ type: "full-reload" });
		server.watcher.add(process.cwd()); // instead of `root`
		server.watcher.on("change", (file) => {
			const fullReload = /(.*)(\.(build.js|build.ts|md|txt|json))$/;
			if (fullReload.test(file)) {
				sendFullReload();
			}
		});
		server.watcher.on("add", sendFullReload);
		server.watcher.on("unlink", sendFullReload);
		server.middlewares.use((req, _, next) => {
			if (!req.url) return next();
			// remove the empty strings since `dynPath` will not have those
			const reqSegments = req.url.split("/").filter((v) => v !== "");
			const actualPaths = Object.keys(entryPoints);
			// ones that have "[" will be dynamic
			const dynPaths = actualPaths.filter((v) => v.includes("["));
			for (const dynPath of dynPaths) {
				const dynSegments = dynPath.split(path.sep);
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
							req.url = "/" + reqSegments.join("/");
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
				req.url += "/";
			}
			return next();
		});
	};
	return serverHook;
};

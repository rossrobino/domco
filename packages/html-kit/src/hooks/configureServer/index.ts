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
};

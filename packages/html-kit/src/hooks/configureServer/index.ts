import type { ServerHook } from "vite";
import { info } from "../../info";

export const configureServer: ServerHook = (server) => {
	server.watcher.on("change", (file) => {
		if (file.startsWith(info.files.indexBuild)) {
			server.ws.send({
				type: "full-reload",
			});
		}
	});
};

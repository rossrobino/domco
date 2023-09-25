import type { ServerHook } from "vite";
import { info } from "../config";

export const configureServer: ServerHook = (server) => {
	server.watcher.on("change", (file) => {
		if (file.startsWith(info.fileNames.indexBuild)) {
			server.ws.send({
				type: "full-reload",
			});
		}
	});
};

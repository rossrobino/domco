import { dirNames } from "../../constants/index.js";
import { createRoutes } from "../../util/create-routes/index.js";
import { toPosix } from "../../util/fs/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

export const routesId = "domco:routes";

export const routesPlugin = async (): Promise<Plugin> => {
	const resolvedRoutesId = "\0" + routesId;

	const routes = await createRoutes();

	return {
		name: routesId,
		apply: "build",
		resolveId(id) {
			if (id === routesId) {
				return resolvedRoutesId;
			}
		},

		async load(id) {
			if (id === resolvedRoutesId) {
				let imp = "";
				let exp = "\nexport const routes = {\n";

				let i = 0;
				for (let [k, v] of Object.entries(routes)) {
					exp += `\t"${k}": {`;
					if (v.server) {
						imp += `import * as route${i} from ".${toPosix(v.server)}";\n`;
						exp += `\n\t\tserver: route${i},`;
						i++;
					}
					if (v.client) {
						// remove leading slash to resolve to a key of vite manifest
						exp += `\n\t\tclient: "${toPosix(v.client).slice(1)}",`;
					}
					if (v.page) {
						exp += `\n\t\tpage: \`${await fs.readFile(
							path.join(
								dirNames.out.base,
								dirNames.out.client.base,
								path.relative(`/${dirNames.src}`, v.page),
							),
						)}\`,`;
					}
					exp += `\n\t},\n`;
				}

				exp += "};\n";

				return imp + exp;
			}
		},
	};
};

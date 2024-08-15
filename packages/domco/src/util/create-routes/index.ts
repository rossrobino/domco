import { setup, dirNames, fileNames } from "../../constants/index.js";
import {
	fileExists,
	findFiles,
	toAllScriptEndings,
	toPosix,
} from "../fs/index.js";
import path from "node:path";

/**
 * @returns keys are routes and values are RouteModules
 */
export const createRoutes = async () => {
	const dir = dirNames.src;

	const serverFiles = await findFiles({
		dir,
		checkEndings: toAllScriptEndings(fileNames.server),
	});

	// add init
	for (const fileName of toAllScriptEndings(fileNames.setup)) {
		const filePath = path.join(process.cwd(), dirNames.src, fileName);
		if (await fileExists(filePath)) {
			serverFiles[setup] = toPosix(
				"/" + path.relative(process.cwd(), filePath),
			);
			break;
		}
	}

	const clientFiles = await findFiles({
		dir,
		checkEndings: toAllScriptEndings(fileNames.client),
	});

	const htmlFiles = await findFiles({
		dir,
		checkEndings: [fileNames.page],
	});

	const routes: {
		[routeId: string]: { page?: string; server?: string; client?: string };
	} = {};

	// create routes for both modules and html
	// need to also do html in dev to serve the static file since
	// vite middleware will not serve index.html without appType="mpa"
	for (const routeId in serverFiles) {
		routes[routeId] = {
			server: serverFiles[routeId],
		};
	}

	for (const routeId in htmlFiles) {
		const html = htmlFiles[routeId];

		if (routes[routeId]) {
			routes[routeId].page = html;
		} else {
			routes[routeId] = { page: html };
		}
	}

	for (const routeId in clientFiles) {
		const client = clientFiles[routeId]
			? `/${toPosix(path.relative("/" + dirNames.src, clientFiles[routeId]))}`
			: undefined;

		if (routes[routeId]) {
			routes[routeId].client = client;
		} else {
			routes[routeId] = { client };
		}
	}

	return routes;
};

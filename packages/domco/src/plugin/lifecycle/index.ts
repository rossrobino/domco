import { dirNames, fileNames } from "../../constants/index.js";
import { codeSize } from "../../util/code-size/index.js";
import { getMaxLengths } from "../../util/get-max-lengths/index.js";
import { version } from "../../version/index.js";
import { styleText } from "node:util";
import { build, type Plugin } from "vite";

export const lifecyclePlugin = (): Plugin => {
	let ssr: boolean | undefined;

	return {
		name: "domco:lifecycle",
		async config(_, { isSsrBuild, command }) {
			ssr = isSsrBuild;
			if (command === "build" && !ssr) {
				console.log();
				console.log(styleText("bold", `domco@${version}`));
				console.log();
			}
		},

		writeBundle(_, bundle) {
			if (!ssr) {
				// initiate server build
				build({
					build: {
						ssr: true,
					},
				});
			}

			const outDir = `${dirNames.out.base}/${ssr ? dirNames.out.ssr : dirNames.out.client.base}`;

			let info = Object.values(bundle).map((v) => {
				const { fileName, code, source } = v as Record<string, any>;

				const { kB, gzip } = codeSize(code ?? source);

				const outDirStr = styleText("dim", outDir + "/");

				let fileNameStr: string;
				if (fileName.endsWith("js")) fileNameStr = styleText("cyan", fileName);
				else if (fileName.endsWith("css"))
					fileNameStr = styleText("magenta", fileName);
				else if (fileName.endsWith("html"))
					fileNameStr = styleText("green", fileName);
				else fileNameStr = styleText("red", fileName);

				return {
					path: `${outDirStr}${fileNameStr}`,
					kB,
					gzip,
				};
			});

			// html is bundled in routes so pages are deleted
			info = info.filter((v) => !v.path.includes(fileNames.page));

			if (info.length) {
				info.sort((a, b) => a.path.localeCompare(b.path));

				console.log(
					styleText("bold", ssr ? dirNames.out.ssr : dirNames.out.client.base),
				);

				const maxLengths = getMaxLengths(info);

				for (const file of info) {
					const filePath = file.path.padEnd((maxLengths.path ?? 0) + 2);
					const kB = file.kB.padStart(maxLengths.kB ?? 0) + " kB";
					const gzip = ssr
						? ""
						: ` │ gzip: ${file.gzip.padStart(maxLengths.gzip ?? 0)} kB`;
					console.log(`${filePath}${styleText("dim", kB + gzip)}`);
				}

				console.log();
			}
		},
	};
};

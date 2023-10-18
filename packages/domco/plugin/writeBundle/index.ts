import type { Generated } from "../../types/index.js";
import fs from "node:fs/promises";
import path from "node:path";

export const writeBundle = (options: { generated: Generated }) => {
	const { generated } = options;
	const write = async () => {
		for (const file of generated.add) {
			const { fileName, source } = file;
			const filePath = `${process.cwd()}/dist${fileName}`;
			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, source, "utf-8");
		}
		for (const dir of generated.delete) {
			await fs.rm(`${process.cwd()}/dist${dir}`, {
				recursive: true,
				force: true,
			});
		}
	};
	return write;
};

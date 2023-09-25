import type { PathLike } from "node:fs";
import fs from "node:fs/promises";

/**
 * @param filePath
 * @returns true if the file exists
 */
export const fileExists = async (filePath: PathLike) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

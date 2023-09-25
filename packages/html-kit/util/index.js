import fs from "node:fs/promises";

/**
 * @param {import("fs").PathLike} filePath
 * @returns true if the file exists
 */
export const fileExists = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

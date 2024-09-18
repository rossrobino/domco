import zlib from "zlib";

/**
 * Gets the size and gzip size of a string.
 *
 * @param code The raw text.
 * @returns The size and gzip size of the file in kB
 */
export const codeSize = (code: string) => {
	const kB = (Buffer.byteLength(code ?? "", "utf-8") / 1000).toFixed(2);

	const buffer = Buffer.from(code, "utf-8");
	const gzipBuffer = zlib.gzipSync(buffer);
	const gzip = (gzipBuffer.length / 1000).toFixed(2);

	return { kB, gzip };
};

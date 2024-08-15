import zlib from "zlib";

export const codeSize = (s: string) => {
	const kB = (Buffer.byteLength(s ?? "", "utf-8") / 1000).toFixed(2);

	const buffer = Buffer.from(s, "utf-8");
	const gzipBuffer = zlib.gzipSync(buffer);
	const gzip = (gzipBuffer.length / 1000).toFixed(2);

	return { kB, gzip };
};

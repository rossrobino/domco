/**
 * @param start time in ms
 * @param end time in ms
 * @returns formatted string ms/s
 */
export const getTime = (start: number, end: number) => {
	const ms = end - start;
	if (ms > 999) {
		return `${(ms / 1000).toFixed(2)}s`;
	} else {
		return `${Math.ceil(ms)}ms`;
	}
};

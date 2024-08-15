/**
 * Get the max lengths of each string value of an array of objects.
 *
 * @param array array of objects with values as strings
 * @returns an object containing the longest length of each key
 */
export const getMaxLengths = <T extends Record<string, string>>(array: T[]) => {
	const maxLengths: { [key: string]: number } = {};

	array.forEach((item) => {
		Object.keys(item).forEach((key) => {
			const length = item[key as any]?.length ?? 0;
			if (!maxLengths[key] || length > maxLengths[key]) {
				maxLengths[key] = length;
			}
		});
	});

	return maxLengths as { [K in keyof T]: number };
};

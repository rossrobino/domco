/**
 * Gets the parameters of the route based on the pattern
 *
 * @param pattern a pattern route - for example `posts/[postId]/[name]`
 * @param actual the actual route - `posts/123/hello-world`
 * @returns the params - `{ postId: "123", name: "hello-world" }
 */
export const getParams = async (pattern: string, actual: string) => {
	const patternParts = pattern.split("/");
	const actualParts = actual.split("/");
	const params: { [key: string]: string } = {};

	if (patternParts) {
		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts.at(i);
			const actualPart = actualParts.at(i);
			if (patternPart && actualPart) {
				if (patternPart.startsWith("[") && patternPart.endsWith("]")) {
					const key = patternPart.slice(1, -1);
					params[key] = actualPart;
				}
			}
		}
	}
	return params;
};

/**
 * Inserts the parameters into the route
 *
 * @param pattern a pattern route - for example `posts/[postId]/[name]`
 * @param params the params - `{ postId: "123", name: "hello-world" }
 * @returns the actual route - `posts/123/hello-world`
 */
export const insertParams = async (
	pattern: string,
	params: Record<string, string>,
) => {
	return pattern
		.split("/")
		.map((part) =>
			part.startsWith("[") && part.endsWith("]") && params[part.slice(1, -1)]
				? params[part.slice(1, -1)]
				: part,
		)
		.join("/");
};

/**
 * trims the dynamic route to the first dynamic segment
 *
 * @param route the dynamic route, for example `/posts/[postId]/[another]`
 * @returns the first dynamic dir, in this case - `/posts/[postId]`
 */
export const trimDynamic = async (route: string) => {
	const segments = route.split("/");
	const lastIndex = segments.findIndex(
		(segment) => segment.startsWith("[") && segment.endsWith("]"),
	);
	return segments.slice(0, lastIndex + 1).join("/");
};

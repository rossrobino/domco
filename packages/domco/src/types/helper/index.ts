export type PropertyType<T, K extends keyof T> = T[K];

/** Helper type for a type that could be a promise. */
export type MaybePromise<T> = T | Promise<T>;

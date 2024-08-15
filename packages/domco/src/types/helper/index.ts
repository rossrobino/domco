export type PropertyType<T, K extends keyof T> = T[K];

export type MaybePromise<T> = T | Promise<T>;

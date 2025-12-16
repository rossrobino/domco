/**
 * @param id module ID
 * @returns \0id - for vite resolve hook
 */
export const resolveId = <I extends string>(id: I) => `\0${id}` as const;

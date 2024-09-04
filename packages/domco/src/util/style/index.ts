export const style = {
	bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
	dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
	italic: (s: string) => `\x1b[3m${s}\x1b[23m`,

	cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
	green: (s: string) => `\x1b[32m${s}\x1b[39m`,
	magenta: (s: string) => `\x1b[35m${s}\x1b[39m`,
	red: (s: string) => `\x1b[31m${s}\x1b[39m`,
};

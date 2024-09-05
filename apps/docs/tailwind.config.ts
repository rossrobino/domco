import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{ts,tsx}"],
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				heading: {
					foreground: "var(--heading-foreground)",
				},
				base: {
					50: "var(--base-50)",
					100: "var(--base-100)",
					200: "var(--base-200)",
					300: "var(--base-300)",
					400: "var(--base-400)",
					500: "var(--base-500)",
					600: "var(--base-600)",
					700: "var(--base-700)",
					800: "var(--base-800)",
					900: "var(--base-900)",
					950: "var(--base-950)",
				},
				muted: {
					background: "var(--muted-background)",
					foreground: "var(--muted-foreground)",
				},
				primary: {
					background: "var(--primary-background)",
					foreground: "var(--primary-foreground)",
				},
				secondary: {
					background: "var(--secondary-background)",
					foreground: "var(--secondary-foreground)",
				},
				accent: {
					background: "var(--accent-background)",
					foreground: "var(--accent-foreground)",
				},
				destructive: {
					background: "var(--destructive-background)",
					foreground: "var(--destructive-foreground)",
				},
			},
		},
	},
} satisfies Config;

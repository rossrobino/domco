import denoJson from "./template-files/deno-json.js";
import favicon from "./template-files/favicon.js";
import gitignore from "./template-files/gitignore.js";
import globalTypes from "./template-files/global-types.js";
import packageJson from "./template-files/package-json.js";
import pageHtml from "./template-files/page-html.js";
import prettier from "./template-files/prettier.js";
import styleCss from "./template-files/style-css.js";
import tailwind from "./template-files/tailwind.js";
import tsconfigJson from "./template-files/tsconfig-json.js";
import viteConfig from "./template-files/vite-config.js";
import * as p from "@clack/prompts";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import whichPmRuns from "which-pm-runs";

type PackageManager =
	| ("npm" | "bun" | "pnpm" | "yarn" | "deno")
	| (string & {});

type TemplateFile = { name: string; contents: string };

type GetTemplateFileOptions = {
	dir: string;
	pm: PackageManager;
	lang: string;
	tailwind: boolean;
	prettier: boolean;
	projectName: string;
};

export type GetTemplateFile = (
	options: GetTemplateFileOptions,
) => TemplateFile[];

/**
 * Programmatically create a new domco project.
 */
export const createDomco = async () => {
	p.intro("Welcome to domco");

	const dir = await p.text({
		message: "Where should your project be created?",
		defaultValue: ".",
		placeholder: "(Enter for current directory)",
	});

	if (p.isCancel(dir)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	const lang = await p.select({
		message: "Select language",
		options: [
			{ label: "TypeScript", value: "ts" },
			{ label: "JavaScript", value: "js" },
		],
	});

	if (p.isCancel(lang)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	const extras = await p.multiselect({
		message: "Select additional options (use arrow keys/space bar)",
		required: false,
		options: [
			{
				value: "prettier",
				label: "Add Prettier for formatting",
			},
			{
				value: "tailwind",
				label: "Add TailwindCSS for styling",
			},
		],
	});

	if (p.isCancel(extras)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	const s = p.spinner();

	s.start("Creating project");

	const options: GetTemplateFileOptions = {
		dir,
		lang: String(lang),
		prettier: extras.includes("prettier"),
		tailwind: extras.includes("tailwind"),
		pm: getPackageManager(),
		projectName: getProjectName(dir),
	};

	await writeTemplateFiles(dir, getAllTemplateFiles(options));

	s.stop("Files created");

	p.note(getNote(options), "Next steps");

	p.outro(`https://github.com/rossrobino/domco`);

	process.exit(0);
};

const getAllTemplateFiles: GetTemplateFile = (options) => {
	const getTemplateFileFunctions = [
		denoJson,
		favicon,
		gitignore,
		globalTypes,
		packageJson,
		pageHtml,
		prettier,
		styleCss,
		tailwind,
		tsconfigJson,
		viteConfig,
	];

	const allTemplateFiles: TemplateFile[] = [];

	for (const fn of getTemplateFileFunctions) {
		allTemplateFiles.push(...fn(options));
	}

	return allTemplateFiles;
};

/**
 * Writes an array of files to the specified directory.
 *
 * @param dir the directory to write the files to
 * @param templateFiles the files to write
 * @returns a Promise that resolves when all the files have been written
 */
const writeTemplateFiles = async (
	dir: string,
	templateFiles: TemplateFile[],
) => {
	return Promise.all(
		templateFiles.map(async ({ name, contents }) => {
			const filePath = path.join(dir, name);
			const fileDirectory = path.dirname(filePath);

			// Ensure directory exists
			await fs.mkdir(fileDirectory, { recursive: true });

			// Write file
			return fs.writeFile(filePath, contents);
		}),
	);
};

/** Gets the current package manager. */
const getPackageManager = (): PackageManager => {
	if ("Deno" in globalThis) return "deno";

	return whichPmRuns()?.name || "npm";
};

/**
 * After create instructions.
 *
 * @param options
 * @returns the note as a string
 */
const getNote = ({ dir, pm }: GetTemplateFileOptions) => {
	const cd = dir === "." ? "" : `cd ${dir}\n`;
	const install = pm === "deno" ? "" : `${pm} install\n`;
	const run = `${pm} run dev`;

	return `${cd}${install}${run}`;
};

/**
 * Gets the project name for the package.json `name` field.
 *
 * @param dir directory to create the project in.
 * @returns the project name
 */
const getProjectName = (dir: string) => {
	if (dir === ".") dir = process.cwd();

	return path.basename(dir);
};

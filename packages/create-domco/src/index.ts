import { getDependencies } from "./dependencies/index.js";
import denoJson from "./template-files/deno-json.js";
import envTypes from "./template-files/env-types.js";
import favicon from "./template-files/favicon.js";
import func from "./template-files/func.js";
import gitignore from "./template-files/gitignore.js";
import packageJson from "./template-files/package-json.js";
import pageHtml from "./template-files/page-html.js";
import prettier from "./template-files/prettier.js";
import styleCss from "./template-files/style-css.js";
import tsconfigJson from "./template-files/tsconfig-json.js";
import viteConfig from "./template-files/vite-config.js";
import * as p from "@clack/prompts";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { format } from "prettier";
import whichPmRuns from "which-pm-runs";

type PackageManager = "npm" | "bun" | "pnpm" | "yarn" | "deno" | (string & {});

type TemplateFile = { name: string; contents: string };

type GetTemplateFileOptions = {
	dir: string;
	pm: PackageManager;
	lang: string;
	tailwind: boolean;
	prettier: boolean;
	projectName: string;
	dependencies: Record<string, string>;
};

export type GetTemplateFile = (
	options: GetTemplateFileOptions,
) => TemplateFile[] | Promise<TemplateFile[]>;

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

	try {
		const existingFiles = await fs.readdir(dir);

		if (existingFiles.length) {
			const proceed = await p.confirm({
				message: `The \`${dir}\` directory is not empty, continue?`,
				initialValue: false,
			});

			if (!proceed || p.isCancel(proceed)) {
				p.cancel("Operation cancelled.");
				process.exit(0);
			}
		}
	} catch {
		// will throw if dir doesn't exist - OK, should proceed
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
		dependencies: getDependencies(),
	};

	await writeTemplateFiles(dir, await getAllTemplateFiles(options));

	s.stop("Files created");

	p.note(getNote(options), "Next steps");

	p.outro(`https://github.com/rossrobino/domco`);

	process.exit(0);
};

const getAllTemplateFiles: GetTemplateFile = async (options) => {
	const getTemplateFileFunctions = [
		func,
		denoJson,
		favicon,
		gitignore,
		envTypes,
		packageJson,
		pageHtml,
		prettier,
		styleCss,
		tsconfigJson,
		viteConfig,
	];

	const allTemplateFiles: TemplateFile[] = [];

	for (const fn of getTemplateFileFunctions) {
		allTemplateFiles.push(...(await fn(options)));
	}

	for (const templateFile of allTemplateFiles) {
		// format files with prettier
		const ext = path.extname(templateFile.name).slice(1);

		try {
			if (["html", "css", "json", "md"].includes(ext)) {
				templateFile.contents = await format(templateFile.contents, {
					parser: ext,
					useTabs: true,
				});
			} else if (["ts", "js"].includes(ext)) {
				templateFile.contents = await format(templateFile.contents, {
					parser: "babel-ts",
					useTabs: true,
				});
			}
		} catch (error) {
			p.log.error(`Error formatting ${templateFile.name}:\n\n${error}\n`);
		}
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
	const install = `${pm} install\n`;
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

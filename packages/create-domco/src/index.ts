import { getDependencies } from "./dependencies/index.js";
import app from "./template-files/app.js";
import envTypes from "./template-files/env-types.js";
import favicon from "./template-files/favicon.js";
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
import type { AgentName } from "package-manager-detector";
import { getUserAgent } from "package-manager-detector/detect";
import { format } from "prettier";

const cancelMessage = "Operation cancelled";

type TemplateFile = { name: string; content: string };

type GetTemplateFileOptions = {
	framework: null | "ovr" | "hono";
	adapter: null | "cloudflare" | "deno" | "vercel";
	dir: string;
	pm: AgentName;
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
		p.cancel(cancelMessage);
		process.exit(0);
	}

	try {
		const existingFiles = await fs.readdir(dir, {
			withFileTypes: true,
		});

		if (existingFiles.length) {
			p.log.warn("WARNING: Existing files could be overwritten.");

			p.note(
				`${dir}/${existingFiles
					.map((file, i) => {
						let fileName = path.relative(
							dir,
							path.join(file.parentPath, file.name),
						);

						if (!file.isFile()) fileName += "/...";

						if (i === existingFiles.length - 1) {
							return `\n└── ${fileName}`;
						}

						return `\n├── ${fileName}`;
					})
					.join("")}`,
			);

			const proceed = await p.confirm({
				message: `The \`${dir}/\` directory is not empty, continue?`,
				initialValue: false,
			});

			if (!proceed || p.isCancel(proceed)) {
				p.cancel(cancelMessage);
				process.exit(0);
			}
		}
	} catch {
		// will throw if dir doesn't exist - OK, should proceed
	}

	const lang = await p.select({
		message: "Language (arrow keys + enter)",
		initialValue: "ts",
		options: [
			{ label: "TypeScript", value: "ts" },
			{
				label: "JavaScript",
				value: "js",
				hint: "remove `tsconfig.json` to disable type checking",
			},
		],
	});

	if (p.isCancel(lang)) {
		p.cancel(cancelMessage);
		process.exit(0);
	}

	const framework = await p.select({
		message: "Framework",
		initialValue: null,
		options: [
			{
				value: null,
				label: "none",
			},
			{
				value: "hono",
				label: "hono",
				hint: "https://hono.dev",
			},
			{
				value: "ovr",
				label: "ovr",
				hint: "https://github.com/rossrobino/ovr",
			},
		],
	});

	if (p.isCancel(framework)) {
		p.cancel(cancelMessage);
		process.exit(0);
	}

	const adapter = await p.select({
		message: "Deployment adapter",
		initialValue: null,
		options: [
			{
				value: null,
				label: "none",
				hint: "you can add one later - https://domco.robino.dev/deploy#adapters",
			},
			{
				value: "cloudflare",
				label: "cloudflare",
				hint: "https://domco.robino.dev/deploy#cloudflare",
			},
			{
				value: "deno",
				label: "deno",
				hint: "https://domco.robino.dev/deploy#deno",
			},
			{
				value: "vercel",
				label: "vercel",
				hint: "https://domco.robino.dev/deploy#vercel",
			},
		],
	});

	if (p.isCancel(adapter)) {
		p.cancel(cancelMessage);
		process.exit(0);
	}

	const extras = await p.multiselect({
		message: "Additional options (space bar / a)",
		required: false,
		options: [
			{
				value: "prettier",
				label: "Add Prettier for formatting",
				hint: "https://prettier.io/",
			},
			{
				value: "tailwind",
				label: "Add TailwindCSS for styling",
				hint: "https://tailwindcss.com/",
			},
		],
	});

	if (p.isCancel(extras)) {
		p.cancel(cancelMessage);
		process.exit(0);
	}

	const s = p.spinner();

	s.start("Creating project");

	const pm = getUserAgent();

	if (!pm) throw new Error("Unable to identify package manager.");

	const options: GetTemplateFileOptions = {
		projectName: getProjectName(dir),
		dir,
		lang,
		framework,
		adapter,
		prettier: extras.includes("prettier"),
		tailwind: extras.includes("tailwind"),
		pm,
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
		app,
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
				templateFile.content = await format(templateFile.content, {
					parser: ext,
					useTabs: true,
				});
			} else if (["ts", "js"].includes(ext)) {
				templateFile.content = await format(templateFile.content, {
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
		templateFiles.map(async ({ name, content: contents }) => {
			const filePath = path.join(dir, name);
			const fileDirectory = path.dirname(filePath);

			// Ensure directory exists
			await fs.mkdir(fileDirectory, { recursive: true });

			// Write file
			return fs.writeFile(filePath, contents);
		}),
	);
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

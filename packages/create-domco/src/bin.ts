#!/usr/bin/env node
import { getFiles } from "./template/index.js";
import * as p from "@clack/prompts";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import whichPmRuns from "which-pm-runs";

/**
 * Writes an array of files to the specified directory.
 * @param directory - the directory to write the files to
 * @param files - the files to write
 * @returns a Promise that resolves when all the files have been written
 */
const writeFiles = async (
	directory: string,
	files: { name: string; contents: string }[],
) => {
	return Promise.all(
		files.map(async (file) => {
			const filePath = join(directory, file.name);
			const fileDirectory = dirname(filePath);

			// Ensure directory exists
			await mkdir(fileDirectory, { recursive: true });

			// Write file
			return writeFile(filePath, file.contents);
		}),
	);
};

const pm = whichPmRuns()?.name || "npm";

p.intro("Welcome to domco");

let dir = await p.text({
	message: "Where should your project be created?",
	defaultValue: ".",
	placeholder: "(Enter for current directory)",
});

if (p.isCancel(dir)) {
	p.cancel("Operation cancelled.");
	process.exit(0);
} else {
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
	} else {
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
		} else {
			const prettier = extras.includes("prettier");
			const tailwind = extras.includes("tailwind");

			const s = p.spinner();

			s.start("Creating project");

			await writeFiles(
				dir,
				getFiles({ lang: String(lang), prettier, tailwind }),
			);

			s.stop("Files created");

			p.note(
				`${dir === "." ? "" : `cd ${dir}\n`}${pm} install\n${pm} run dev`,
				`Next steps`,
			);

			p.outro(`https://github.com/rossrobino/domco`);
		}
	}
}

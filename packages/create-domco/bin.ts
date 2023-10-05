#!/usr/bin/env node

import * as p from "@clack/prompts";
import { getFiles } from "./template/index.js";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

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

			p.outro(
				`Complete!\n\n${
					dir === "." ? "" : `cd ${dir}\n`
				}npm install\nnpm run dev`,
			);
		}
	}
}

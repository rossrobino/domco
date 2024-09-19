import fs from "node:fs/promises";

const { version } = JSON.parse(await fs.readFile("package.json", "utf-8"));

console.log("building " + version);

await fs.writeFile(
	"src/version/index.ts",
	`// this file is generated in scripts/version/index.ts
// this might be out of sync with github until the project is built and committed.
// npm will have the correct version.
export const version = "${version}";\n`,
);

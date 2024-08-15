import fs from "node:fs/promises";

const { version } = JSON.parse(await fs.readFile("package.json", "utf-8"));

console.log("building " + version);

await fs.writeFile(
	"src/version/index.ts",
	`export const version = "${version}";\n`,
);

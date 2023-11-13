import fs from "fs/promises";
import path from "node:path";

const removeMdLinks = async (dirPath: string) => {
	const files = await fs.readdir(dirPath, { withFileTypes: true });

	for (const file of files) {
		const filePath = path.join(dirPath, file.name);
		if (file.isDirectory()) {
			await removeMdLinks(filePath);
		}
		if (filePath.endsWith("md")) {
			const mdFile = Bun.file(filePath);
			let text = await mdFile.text();
			text = text.replaceAll(".md", "");
			text = text.replaceAll("html-kit", "domco");
			text = text.replaceAll("\\>", ">");
			text = text.replaceAll("# domco", "");
			await Bun.write(filePath, text);
			console.log("modified: " + filePath);
		}
	}
};

removeMdLinks("docs");

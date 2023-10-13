import { Build } from "domco";

export const params = [
	{ postId: "my-post" },
	{ postId: "another-post" },
] as const;

export const build: Build<typeof params> = async ({ document }, { params }) => {
	const h2 = document.querySelector("h2");
	if (h2) h2.textContent = params.postId;
};

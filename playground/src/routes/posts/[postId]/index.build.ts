import { Build } from "domco";

export const params: { postId: string }[] = [];

for (let i = 0; i < 50; i++) {
	params.push({ postId: `post-${i + 1}` });
}

export const build: Build<typeof params> = async ({ document }, { params }) => {
	const h2 = document.querySelector("h2");
	if (h2) h2.textContent = params.postId;
};

import { Build } from "domco";

export const params = [{ postId: "my-post" }, { postId: "another-post" }];

export const build: Build = async ({ document }, { route, params }) => {
	const h2 = document.querySelector("h2");
	if (h2 && params.postId) h2.textContent = route.url;
};

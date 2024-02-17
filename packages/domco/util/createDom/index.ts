import { JSDOM } from "jsdom";

export const createDom = (html: string) => {
	return new JSDOM(html);
};

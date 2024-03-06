import { JSDOM } from "jsdom";

export const createDom = (html: string) => {
	return new JSDOM(html);
};

export const serializeDom = (dom: JSDOM) => {
	return dom.serialize();
}

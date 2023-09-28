import { JSDOM } from "jsdom";

const dom = new JSDOM(
	`<!DOCTYPE html><body><custom-element shadowrootmode="open">hi</custom-element></body>`,
);

const template = dom.window.document.createElement("template");
template.innerHTML = `
		<template>A custom Element<slot></slot></template>
	`;
dom.window.customElements.define(
	"custom-element",
	class extends dom.window.HTMLElement {
		constructor() {
			super();
		}
		connectedCallback() {
			this.appendChild(template.content.cloneNode(true));
			console.log("hello from custom element!");
		}
	},
);
dom.window.document.createElement("custom-element");

console.log(dom.serialize()); // <!DOCTYPE html><html><head></head><body><custom-element>hi</custom-element></body></html>

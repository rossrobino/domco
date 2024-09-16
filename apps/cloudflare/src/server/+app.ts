import { html } from "client:page";
import { Hono } from "hono";

export const prerender = ["/"];

const app = new Hono();

app.get("/", (c) => c.html(html));

export const handler = app.fetch;

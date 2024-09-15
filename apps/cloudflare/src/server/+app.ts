import { Hono } from "hono";
import page from "client:page";

export const prerender = true;

const app = new Hono();

app.get("/", (c) => c.html(page));

export default app.fetch;

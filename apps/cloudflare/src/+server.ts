import { Hono } from "hono";

export const prerender = true;

const app = new Hono();

app.get("/", (c) => c.html(c.var.page()));

export default app;

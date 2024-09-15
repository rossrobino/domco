import page from "client:page";
import { Hono } from "hono";

export const app = new Hono();

app.get("/", (c) => c.html(page));

export default app.fetch;

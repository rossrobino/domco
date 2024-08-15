import { Hono } from "hono";
// import { etag } from "hono/etag";
import { logger } from "hono/logger";

export const prerender = true;

const setup = new Hono();

// if (import.meta.env.PROD) setup.use(etag());

if (import.meta.env.DEV) setup.use(logger());

export default setup;

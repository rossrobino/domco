import { Layout } from "./components/Layout";
import { Hono } from "hono";

const setup = new Hono();

setup.use(async (c, next) => {
	c.setRenderer(({ title }, content) => {
		return c.html(
			<Layout title={title} client={c.var.client()}>
				{content}
			</Layout>,
		);
	});
	await next();
});

export default setup;

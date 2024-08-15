import { inject } from "@/mw";
import { Injector } from "domco/injector";
import { Hono } from "hono";
import { validator } from "hono/validator";

export const app = new Hono();

app
	.use(
		"/",
		inject({
			comment: [
				{ text: "server", children: [{ tag: "p", children: "hello" }] },
			],
		}),
	)
	.post(
		"/",
		validator("form", (value, c) => {
			const { test } = value;
			if (!test || typeof test !== "string") {
				return c.html(
					new Injector(c.var.page())
						.comment([{ text: "result", children: "Please enter some text" }])
						.title("Invalid").html,
				);
			}
			return {
				test,
			};
		}),
		(c) => {
			const { test } = c.req.valid("form");
			return c.html(
				new Injector(c.var.page())
					.comment([{ text: "result", children: "Success: " + test }])
					.title("Success").html,
			);
		},
	)
	.get("/", inject({ title: "Home", handler: true }));

export default app;

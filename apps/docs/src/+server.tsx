import {
	BookSvg,
	EarthSvg,
	FuncSvg,
	NpmSvg,
	PlugSvg,
	RepoSvg,
	TypeSvg,
} from "./components/svg";
import preview from "@/content/preview.md?raw";
import tutorial from "@/content/tutorial.md?raw";
import apiReference from "@/generated/README.md?raw";
import { Hono } from "hono";
import { raw } from "hono/html";
import type { FC } from "hono/jsx";
import { processMarkdown } from "robino/util/md";

export const prerender = true;

const app = new Hono();

app.get("/*", async (c, next) => {
	c.setRenderer(({ title }, content) => {
		return c.html(
			<html class="tabular-nums motion-safe:scroll-smooth">
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<link rel="icon" type="image/svg+xml" href="/vite.svg" />
					<meta name="description" content="hello" />
					<title>{title}</title>
					{c.var.client()}
				</head>
				<body>{content}</body>
			</html>,
		);
	});
	await next();
});

app.get("/", async (c) => {
	const tutorialHtml = raw((await processMarkdown(tutorial)).html);
	const previewHtml = raw((await processMarkdown(preview)).html);
	let apiReferenceHtml = (await processMarkdown(apiReference)).html;
	apiReferenceHtml = raw(apiReferenceHtml.replaceAll("README.md#", "#"));

	return c.render(
		{ title: "domco" },
		<>
			<header class="m-6 mb-48">
				<div class="flex items-center justify-between">
					<h1 class="m-0">domco</h1>
					<div class="flex items-center gap-1">
						<RepoSvg />
						<NpmSvg />
					</div>
				</div>
				<section class="flex h-[70dvh] flex-col justify-center">
					<h2 class="text-balance text-4xl">
						Construct Web Applications with{" "}
						<a href="https://vitejs.dev">Vite</a> and{" "}
						<a href="https://hono.dev/">Hono</a>
					</h2>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
						<Npm />
						<BundleSize />
					</div>
				</section>
				<section class="font-bold">{previewHtml}</section>
			</header>
			<main class="m-6">
				<section class="mb-48">
					<h2>TL;DR</h2>
					<p>
						<strong>domco</strong> is a minimal library that turns your{" "}
						<a href="https://vitejs.dev">Vite</a> project into a{" "}
						<a href="https://hono.dev/">Hono</a> application. You can take
						advantage of Vite's build pipeline, plugins, and HMR in a full-stack
						context with Hono.
					</p>
					<ul>
						<li>
							Create a new <code>+page.html</code> within <code>src</code>, you
							have a public page.
						</li>
						<li>
							Add a <code>+server</code> file within <code>src</code> and export
							a Hono app, you have an endpoint.
						</li>
						<li>
							Use a <code>+client</code> file to add a client side script. These
							tags be accessed from a page, or directly from an endpoint.
						</li>
					</ul>
				</section>
				<section class="mb-48 grid gap-6 sm:grid-cols-2">
					<NavLink
						Icon={BookSvg}
						title="Tutorial"
						text="Get started or add domco to an existing Vite application."
					/>
					<NavLink
						Icon={PlugSvg}
						title="Migrate"
						text="Add Hono to an Existing Vite Project."
					/>
					<NavLink
						Icon={EarthSvg}
						title="Deploy"
						text="Learn how to deploy your application."
					/>
					<NavLink Icon={TypeSvg} title="Type Aliases" text="API Reference." />
					<NavLink Icon={FuncSvg} title="Functions" text="API Reference." />
				</section>

				<section>{tutorialHtml}</section>
				<section>{apiReferenceHtml}</section>
			</main>
		</>,
	);
});

export default app;

const Npm: FC = () => {
	const words = "npm create domco@latest".split(" ");
	const chars = words.map((w) => w.split(""));
	return (
		<div id="npm" class="copy-text font-mono">
			{chars.map((char, i) => {
				return (
					<>
						<npm-word>
							{char.map((c, j) => {
								return (
									<npm-char style={`--char-index: ${(i + 1) * j}`}>
										{c}
									</npm-char>
								);
							})}
						</npm-word>{" "}
						{i !== chars.length - 1 && <span />}
					</>
				);
			})}
		</div>
	);
};

interface NavLinkProps {
	title: string;
	text: string;
	Icon: FC;
}

const NavLink: FC<NavLinkProps> = ({ title, text, Icon }: NavLinkProps) => {
	return (
		<a
			class="text-background rounded-lg bg-white p-4 no-underline opacity-90 transition-transform hover:scale-[101%]"
			href={`#${title.split(" ").join("-").toLowerCase()}`}
		>
			<div class="mb-2 flex items-center gap-2 text-lg font-bold">
				<Icon />
				{title}
			</div>
			<div>{text}</div>
		</a>
	);
};

const BundleSize: FC = async () => {
	const res = await fetch(
		"https://bundlephobia.com/api/size?package=domco@next",
	);
	const json = (await res.json()) as {
		assets?: [{ size: number; gzip: number }];
	};
	const kB = ((json.assets?.at(0)?.size ?? 0) / 1000).toFixed(1);
	const gzip = ((json.assets?.at(0)?.gzip ?? 0) / 1000).toFixed(1);
	return (
		<a
			href="https://bundlephobia.com/package/domco"
			class="border-muted-foreground flex items-center gap-3 text-sm no-underline sm:border-l sm:pl-4"
		>
			<div class="text-muted-foreground">{kB}kB</div>
			<div class="text-muted-foreground">gzip: {gzip}kB</div>
		</a>
	);
};

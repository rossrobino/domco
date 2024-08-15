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
import apiReference from "@/generated/globals.md?raw";
import { Hono } from "hono";
import { html, raw } from "hono/html";
import type { FC } from "hono/jsx";
import { processMarkdown } from "robino/util/md";

export const prerender = true;

const app = new Hono();

const HtmlLayout: FC = (props) => html`
	<!doctype html>
	${props.children}
`;

app.get("/", async (c, next) => {
	c.setRenderer(({ title }, content) => {
		return c.html(
			<HtmlLayout>
				<html lang="en" class="tabular-nums motion-safe:scroll-smooth">
					<head>
						<meta charset="UTF-8" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1.0"
						/>
						{c.var.client()}
						<link rel="icon" type="image/svg+xml" href="/vite.svg" />
						<meta
							name="description"
							content="Construct Web Applications with Vite and Hono."
						/>
						<title>{title}</title>
					</head>
					<body>{content}</body>
				</html>
			</HtmlLayout>,
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
					<h1 class="m-0">
						<a href="#">domco</a>
					</h1>
					<div class="flex items-center gap-1">
						<RepoSvg />
						<NpmSvg />
					</div>
				</div>
				<section class="flex h-[70dvh] flex-col justify-center">
					<h2 class="text-balance text-4xl">
						Construct Web Applications with{" "}
						<a
							href="https://vitejs.dev"
							class="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent"
						>
							Vite
						</a>{" "}
						and{" "}
						<a
							href="https://hono.dev/"
							class="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
						>
							Hono
						</a>
					</h2>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
						<Npm />
						<BundleSize />
					</div>
				</section>
				<section>{previewHtml}</section>
			</header>
			<main class="m-6">
				<section class="mb-48 grid gap-6 sm:grid-cols-2">
					<NavLink
						Icon={BookSvg}
						title="Tutorial"
						text="Get started with domco"
					/>
					<NavLink
						Icon={PlugSvg}
						title="Migrate"
						text="Add Hono to an existing Vite project"
					/>
					<NavLink
						Icon={EarthSvg}
						title="Deploy"
						text="Deploy your application"
					/>
					<NavLink Icon={TypeSvg} title="Type Aliases" text="API reference" />
					<NavLink Icon={FuncSvg} title="Functions" text="API reference" />
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
		assets?: [{ size: number }];
	};
	const kB = ((json.assets?.at(0)?.size ?? 0) / 1000).toFixed(1);
	return (
		<a
			href="https://bundlephobia.com/package/domco"
			class="border-muted-foreground flex items-center gap-3 text-sm no-underline sm:border-l sm:pl-4"
		>
			<div class="text-muted-foreground">{kB}kB</div>
		</a>
	);
};

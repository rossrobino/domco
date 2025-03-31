import { Nav } from "./Nav";
import { html } from "hono/html";
import { raw } from "hono/html";
import type { FC, PropsWithChildren } from "hono/jsx";

const HtmlLayout: FC = ({ children }) => html`
	<!doctype html>
	${children}
`;

type LayoutProps = PropsWithChildren<{
	title: string;
	tags: string;
}>;

export const Layout: FC<LayoutProps> = ({ title, children, tags: client }) => {
	return (
		<HtmlLayout>
			<html lang="en" class="motion-safe:scroll-smooth">
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					{raw(client)}
					<link rel="icon" type="image/svg+xml" href="/circle.svg" />
					<meta name="description" content="Minimal Full-Stack JavaScript" />
					<title>{title}</title>
				</head>
				<body class="tabular-nums">
					<drab-prefetch trigger="a[href^='/']" prerender class="contents">
						<main class="flex flex-col lg:flex-row">
							<Nav />
							<div class="grow justify-center md:flex">
								<div class="prose m-6 max-w-[700px]">{children}</div>
							</div>
						</main>
					</drab-prefetch>
				</body>
			</html>
		</HtmlLayout>
	);
};

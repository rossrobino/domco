import { Nav } from "./Nav";
import { html } from "hono/html";
import type { FC, PropsWithChildren } from "hono/jsx";
import type { HtmlEscapedString } from "hono/utils/html";

const HtmlLayout: FC = ({ children }) => html`
	<!doctype html>
	${children}
`;

type LayoutProps = PropsWithChildren<{
	title: string;
	client: HtmlEscapedString;
}>;

export const Layout: FC<LayoutProps> = ({ title, children, client }) => {
	return (
		<HtmlLayout>
			<html lang="en" class="motion-safe:scroll-smooth">
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					{client}
					<link rel="icon" type="image/svg+xml" href="/vite.svg" />
					<meta
						name="description"
						content="A Minimal Full-Stack JavaScript Framework."
					/>
					<title>{title}</title>
				</head>
				<body class="tabular-nums">
					<drab-prefetch trigger="a[href^='/']" class="contents">
						<main class="flex flex-col lg:flex-row">
							<Nav />
							<div class="prose mx-6 my-6 max-w-screen-sm md:mx-auto">
								{children}
							</div>
						</main>
					</drab-prefetch>
				</body>
			</html>
		</HtmlLayout>
	);
};

import { BookSvg, EarthSvg, HomeSvg, PlugSvg, XSvg } from "./svg";
import type { FC } from "hono/jsx";

export const Nav: FC = () => {
	return (
		<>
			<SideBar />
			<TopBar />
		</>
	);
};

type NavLinkProps = {
	title: string;
	Icon: FC;
};

const SideBar: FC = () => {
	return (
		<nav class="bg-muted-background sticky top-0 hidden h-screen w-[20vw] min-w-56 justify-end overflow-y-auto lg:flex">
			<div class="flex flex-col py-6 pr-12 pl-6">
				<div class="pb-6">
					<HomeLink />
				</div>
				<div class="flex grow flex-col justify-between">
					<InternalLinks />
					<ExternalLinks />
				</div>
			</div>
		</nav>
	);
};

const HomeLink = () => (
	<a class="text-xl font-bold no-underline" href="/">
		domco
	</a>
);

const TopBar: FC = () => {
	return (
		<drab-dialog
			class="sticky top-0 z-10 flex items-center gap-3 p-3 backdrop-blur-md lg:hidden"
			click-outside-close
			remove-body-scroll
			animation-keyframe-from-transform="translateX(-100%)"
			animation-keyframe-to-transform="translateX(0)"
		>
			<button
				data-trigger
				aria-label="Open navigation"
				type="button"
				class="ghost"
				id="dialog-trigger"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="4" x2="20" y1="12" y2="12" />
					<line x1="4" x2="20" y1="6" y2="6" />
					<line x1="4" x2="20" y1="18" y2="18" />
				</svg>
			</button>

			<dialog
				data-content
				class="bg-muted-background my-0 ml-0 h-full max-h-dvh shadow-sm backdrop:backdrop-blur"
			>
				<nav class="flex h-full min-w-64 flex-col p-6">
					<div class="flex items-center justify-between pb-6">
						<HomeLink />
						<button data-trigger type="button" class="ghost" title="Close">
							<XSvg />
						</button>
					</div>
					<div class="flex grow flex-col justify-between">
						<InternalLinks />
						<ExternalLinks />
					</div>
				</nav>
			</dialog>
		</drab-dialog>
	);
};

export const InternalLinks: FC = () => {
	const items: NavLinkProps[] = [
		{ title: "Overview", Icon: HomeSvg },
		{ title: "Tutorial", Icon: BookSvg },
		{
			title: "Deploy",
			Icon: EarthSvg,
		},
		{
			title: "Migrate",
			Icon: PlugSvg,
		},
	];

	return (
		<ul class="min-w-36">
			{items.map(({ title, Icon }) => {
				const href =
					title === "Overview"
						? "/"
						: `/${title.split(" ").join("-").toLowerCase()}`;
				return (
					<li>
						<a
							class="flex items-center gap-3 py-1.5 no-underline data-[current]:font-bold"
							href={href}
						>
							<Icon />
							{title}
						</a>
					</li>
				);
			})}
		</ul>
	);
};

const ExternalLinks: FC = () => {
	return (
		<div class="flex items-center gap-1">
			<RepoLink />
			<NpmLink />
		</div>
	);
};

const RepoLink: FC = () => {
	return (
		<a
			href="https://github.com/rossrobino/domco"
			title="Repository"
			class="button ghost icon"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
				<path d="M9 18c-4.51 2-5-2-7-2" />
			</svg>
		</a>
	);
};

const NpmLink: FC = () => {
	return (
		<a href="https://www.npmjs.com/package/domco" class="button ghost icon">
			<svg
				role="img"
				fill="currentColor"
				viewBox="0 0 24 24"
				width="20"
				height="20"
				xmlns="http://www.w3.org/2000/svg"
				class="size-6"
			>
				<title>npm</title>
				<path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
			</svg>
		</a>
	);
};

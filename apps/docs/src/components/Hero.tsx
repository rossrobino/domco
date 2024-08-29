import type { FC } from "hono/jsx";

export const Hero: FC = () => {
	return (
		<section class="mb-36 flex flex-col">
			<h1 class="text-balance text-4xl">
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
			</h1>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<Npm />
				<BundleSize />
			</div>
		</section>
	);
};

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

const BundleSize: FC = async () => {
	const res = await fetch(
		"https://bundlephobia.com/api/size?package=domco@latest",
	);

	let json: {
		assets?: [{ size: number }];
	};

	try {
		json = await res.json();
	} catch (error) {
		console.log(error);

		json = { assets: [{ size: 0 }] };
	}

	const kB = ((json.assets?.at(0)?.size ?? 0) / 1000).toFixed(1);

	return (
		<a
			href="https://bundlephobia.com/package/domco@latest"
			class="border-muted-foreground flex items-center gap-3 font-mono text-sm no-underline sm:border-l sm:pl-4"
		>
			<div class="text-muted-foreground">{kB}kB</div>
		</a>
	);
};

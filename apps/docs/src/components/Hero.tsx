import type { FC } from "hono/jsx";

export const Hero: FC = () => {
	return (
		<section class="flex flex-col">
			<h1>
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
			<Npm />
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

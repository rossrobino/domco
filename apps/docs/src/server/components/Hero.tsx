import type { FC } from "hono/jsx";

export const Hero: FC = () => {
	return (
		<section class="flex flex-col">
			<h1>
				Minimal <span class="whitespace-nowrap">Full-Stack</span> JavaScript
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

import { BotIdClient } from "botid/client";
import { useState } from "react";

export default function App() {
	const [count, setCount] = useState(0);
	return (
		<>
			<title>React</title>

			<h1>React</h1>

			<BotIdClient protect={[{ path: "/api/sensitive", method: "POST" }]} />

			<p>
				<button onClick={() => setCount(count + 1)}>Increment {count}</button>
			</p>

			<form action="/api/sensitive" method="POST">
				<button>Sensitive</button>
			</form>
		</>
	);
}

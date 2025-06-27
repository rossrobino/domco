import { useState } from "react";

export default function App() {
	const [count, setCount] = useState(0);
	return (
		<>
			<title>React</title>

			<h1>React</h1>

			<p>
				<button onClick={() => setCount(count + 1)}>Increment {count}</button>
			</p>
		</>
	);
}

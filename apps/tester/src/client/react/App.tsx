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

			<form
				action="/api/sensitive"
				method="POST"
				onSubmit={async (e) => {
					e.preventDefault();
					const res = await fetch("/api/sensitive", { method: "POST" });
					const json = await res.json();
					console.log(json);
				}}
			>
				<button>Sensitive</button>
			</form>
		</>
	);
}

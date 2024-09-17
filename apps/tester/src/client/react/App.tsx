import { useState } from "react";

export default function App() {
	const [count, setCount] = useState(0);
	return (
		<>
			<button onClick={() => setCount(count + 1)}>Increment</button>
			<p>Count: {count}</p>
		</>
	);
}

<script lang="ts">
	import { onMount } from "svelte";

	onMount(() => console.log("mounted"));
	console.log("svelte");

	// ts test
	let count: number = 0;
</script>

<svelte:head><title>svelte</title></svelte:head>

<h1>Svelte</h1>

<button on:click={() => count++}>Increment</button>

<p>{count}</p>

<style>
	p {
		color: red;
	}
</style>

<script lang="ts">
	import '../app.css';
	import { API } from '$lib/api';

	let healthy: 'OK' | 'DOWN' | null = null;

	async function check() {
		try {
			const res = await fetch(`${API}/health`);
			healthy = res.ok ? 'OK' : 'DOWN';
		} catch {
			healthy = 'DOWN';
		}
	}
	check();
</script>

<nav class="nav nav-bar">
	<div class="nav-left">
		<a href="/">Home</a>
		<a href="/plan">Plan</a>
		<a href="/plans">Saved Plans</a>
		<a href="/seed">Seed DB</a>
		<a href="/rag">RAG (soon)</a>
	</div>

	<div class="nav-right">
		<span class="status {healthy === 'OK' ? 'ok' : 'down'}" title={API} aria-live="polite">
			{#if healthy === 'OK'}<span>●</span> Server
			{:else if healthy === 'DOWN'}<span>●</span> Server
			{:else}…checking
			{/if}
		</span>
	</div>
</nav>

<main class="container">
	<slot />
</main>

<footer class="footer">Agentic Tutor • SvelteKit + FastAPI</footer>

<style>
	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.nav-left {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	.nav-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
</style>

<script lang="ts">
	import { api } from '$lib/api';
	let query = 'What is a SQL JOIN?';
	let hits: { id: number; title: string; snippet: string }[] = [];
	let error: string | null = null;
	let loading = false;

	async function search() {
		error = null;
		hits = [];
		loading = true;
		try {
			// TODO: swap this with your real endpoint soon
			// const out = await api<{hits: typeof hits}>('/rag/search', { method:'POST', body: JSON.stringify({ query, top_k: 6 }) });
			// hits = out.hits;
			await new Promise((r) => setTimeout(r, 500));
			alert('RAG endpoint not implemented yet — wire /rag/search on the backend next.');
		} catch (e: any) {
			error = e?.message ?? 'Failed';
		} finally {
			loading = false;
		}
	}
</script>

<h2>RAG Search (Coming Soon)</h2>
<div class="card">
	<div class="row"><label>Query<input class="input" bind:value={query} /></label></div>
	<button class="btn primary" on:click={search} disabled={loading}
		>{loading ? 'Searching…' : 'Search'}</button
	>
</div>

{#if hits.length}
	<div class="card">
		<h3>Results</h3>
		<div class="grid-auto">
			{#each hits as h}
				<div class="task-card">
					<h4 class="task-title">{h.title}</h4>
					<div class="task-meta">{h.snippet}</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if error}
	<p class="alert error">{error}</p>
{/if}

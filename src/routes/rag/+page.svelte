<script lang="ts">
	import { api } from '$lib/api';

	// Search
	let query = 'What is a SQL JOIN?';
	let hits: { id: number; document_id: number; title: string; chunk: string; score: number }[] = [];
	let loading = false;
	let error: string | null = null;

	async function search() {
		loading = true;
		error = null;
		hits = [];
		try {
			const out = await api<{ hits: typeof hits }>('/rag/search', {
				method: 'POST',
				body: JSON.stringify({ query, top_k: 6 })
			});
			hits = out.hits;
		} catch (e: any) {
			error = e?.message ?? 'Search failed';
		} finally {
			loading = false;
		}
	}

	// Quick ingest (text only)
	let ingTitle = 'SQL Notes';
	let ingText = 'Joins combine rows from two or more tables...';
	let ingTags = 'sql,notes';
	let ingMsg: string | null = null;

	async function ingest() {
		ingMsg = null;
		try {
			const out = await api<{ document_id: number; chunks: number }>('/content/ingest', {
				method: 'POST',
				body: JSON.stringify({ title: ingTitle, text: ingText, tags: ingTags })
			});
			ingMsg = `Ingested doc #${out.document_id} (${out.chunks} chunks)`;
		} catch (e: any) {
			ingMsg = e?.message ?? 'Ingest failed';
		}
	}
</script>

<h2>RAG</h2>

<div class="card">
	<h3>Search</h3>
	<div class="row"><label>Query<input class="input" bind:value={query} /></label></div>
	<button class="btn primary" on:click={search} disabled={loading}
		>{loading ? 'Searching…' : 'Search'}</button
	>
</div>
<br>
{#if hits.length}
	<div class="card">
		<h3>Results</h3>
		<div class="grid-auto">
			{#each hits as h}
				<div class="task-card">
					<h4 class="task-title">{h.title}</h4>
					<div class="task-meta">
						score: {h.score.toFixed(3)} • doc #{h.document_id} • chunk #{h.id}
					</div>
					<p style="margin:.6rem 0 0; white-space: pre-wrap;">{h.chunk}</p>
				</div>
			{/each}
		</div>
	</div>
{:else if !loading}
	<p class="alert">No results yet — try a search.</p>
{/if}

{#if error}<p class="alert error">{error}</p>{/if}

<br />

<div class="card">
	<h3>Quick Ingest (text)</h3>
	<div class="row"><label>Title<input class="input" bind:value={ingTitle} /></label></div>
	<div class="row"><label>Tags<input class="input" bind:value={ingTags} /></label></div>
	<div class="row">
		<label>Text<textarea class="textarea" rows="6" bind:value={ingText}></textarea></label>
	</div>
	<button class="btn" on:click={ingest}>Ingest</button>
	{#if ingMsg}<p class="alert success" style="margin-top:.6rem">{ingMsg}</p>{/if}
</div>

<script lang="ts">
	import { api } from '$lib/api';
	let title = 'Intro to SQL';
	let text = 'Relational databases use tables, rows, and columns...';
	let tags = 'sql,intro';
	let createdId: number | null = null;
	let error: string | null = null;
	let loading = false;

	async function seed() {
		error = null;
		createdId = null;
		loading = true;
		try {
			const out = await api<{ id: number }>('/__seed', {
				method: 'POST',
				body: JSON.stringify({ title, text, tags })
			});
			createdId = out.id;
		} catch (e: any) {
			error = e?.message ?? 'Failed';
		} finally {
			loading = false;
		}
	}
</script>

<h2>Seed Database</h2>
<div class="card">
	<div class="row"><label>Title<input class="input" bind:value={title} /></label></div>
	<div class="row"><label>Tags<input class="input" bind:value={tags} /></label></div>
	<div class="row">
		<label>Text<textarea class="textarea" rows="6" bind:value={text}></textarea></label>
	</div>
	<button class="btn primary" on:click={seed} disabled={loading}
		>{loading ? 'Inserting…' : 'Insert Row'}</button
	>
</div>

{#if createdId}
	<p class="alert success">Inserted row with id <strong>{createdId}</strong></p>
{/if}
{#if error}
	<p class="alert error">{error}</p>
{/if}

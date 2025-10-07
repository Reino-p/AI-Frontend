<script lang="ts">
	import { api } from '$lib/api';
	let plans: { id: number; name: string }[] = [];
	let error: string | null = null;

	(async () => {
		try {
			plans = await api('/plans');
		} catch (e: any) {
			error = e?.message ?? 'Failed';
		}
	})();
</script>

<h2>Saved Plans</h2>
<div class="card">
	{#if plans.length === 0}
		<p>No saved plans yet.</p>
	{:else}
		<ul>
			{#each plans as p}
				<li><a href={`/plans/${p.id}`}>{p.name}</a></li>
			{/each}
		</ul>
	{/if}
	{#if error}<p class="alert error">{error}</p>{/if}
</div>

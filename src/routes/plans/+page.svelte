<script lang="ts">
	import { api } from '$lib/api';
    import { goto } from '$app/navigation';
	type PlanSummary = { id: number; name: string };

	let plans: PlanSummary[] = [];
	let error: string | null = null;
	let loading = true;
	let deleting: number | null = null;

	async function load() {
		error = null;
		loading = true;
		try {
			plans = await api('/plans');
		} catch (e: any) {
			error = e?.message ?? 'Failed to load plans';
		} finally {
			loading = false;
		}
	}

	async function removePlan(id: number) {
		if (!confirm('Delete this plan permanently?')) return;
		deleting = id;
		try {
			await api(`/plans/${id}`, { method: 'DELETE' }, { expectJson: false });
			plans = plans.filter((p) => p.id !== id);
		} catch (e: any) {
			error = e?.message ?? 'Delete failed';
		} finally {
			deleting = null;
		}
	}

    function openPlan(id: number) {
        goto(`/plans/${id}`);
    }

	load();
</script>

<h2>Saved Plans</h2>

{#if loading}
	<div class="grid-auto">
		{#each Array(6) as _}
			<div class="skel-card" aria-hidden="true" style="height: 92px;">
				<div class="skel-title skel-line" style="width:55%"></div>
				<div class="skel-gap"></div>
				<div class="skel-line" style="width:35%"></div>
			</div>
		{/each}
	</div>
{:else if error}
	<p class="alert error">{error}</p>
{:else if plans.length === 0}
	<div class="card">
		<p>No saved plans yet. Generate a plan and click <strong>Save</strong> to see it here.</p>
	</div>
{:else}
<div class="grid-auto">
    {#each plans as p}
      <div
        class="plan-card"
        role="link"
        tabindex="0"
        on:click={() => openPlan(p.id)}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && openPlan(p.id)}
        aria-label={`Open plan ${p.name}`}
      >
        <div class="plan-info">
          <h3 class="plan-name">{p.name}</h3>
          <small class="muted">id: {p.id}</small>
        </div>

        <button
          class="btn danger"
          aria-label="Delete plan"
          title="Delete"
          on:click|stopPropagation={() => removePlan(p.id)}
          on:keydown|stopPropagation
          disabled={deleting === p.id}
        >
          {#if deleting === p.id}
            Deleting…
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path fill="currentColor" d="M6 1h4l1 1h3v2H2V2h3l1-1Zm-3 5h10l-1 9H4L3 6Zm3 2v5h2V8H6Zm4 0H8v5h2V8Z"/>
            </svg>
          {/if}
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
	.plan-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 0.9rem 1rem;
		background: var(--card);
	}
	.plan-card:hover {
		background: var(--card-hover);
	}

	.plan-info {
		display: flex;
		flex-direction: column;
	}
	.plan-name {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
	}

	.btn.danger {
		background: #3b1414;
		border-color: #4b1b1b;
		color: #ff7b72;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.btn.danger:hover {
		background: #5a1f1f;
	}
	.btn.danger[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

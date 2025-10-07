<script lang="ts">
	import { api } from '$lib/api';
	export let params: { id: string };
	let plan: any = null;
	let error: string | null = null;

	(async () => {
		try {
			plan = await api(`/plans/${params.id}`);
		} catch (e: any) {
			error = e?.message ?? 'Failed';
		}
	})();
</script>

{#if plan}
	<div class="card">
		<h2>{plan.name}</h2>
		<pre>
        <small class="goalColor">Goal →</small>           {plan.goal} <br />
        <small class="levelColor">Level →</small>          {plan.level} <br />
        <small class="timeColor">Minutes/day →</small>    {plan.minutes} mins <br />
        <small class="deadlineColor">Deadline →</small>       {plan.deadline} <br />
        </pre>
	</div>

	<br />
	<div class="card">
		<h3>Milestones</h3>
		<ul>
			{#each plan.milestones as m}
				<li>{m.order_index}. {m.text}</li>
			{/each}
		</ul>
	</div>

	<br />
	<div class="card">
		<h3>Tasks</h3>
		<div class="grid-auto">
			{#each plan.tasks as t}
				<div class="task-card">
					<h4 class="task-title">{t.order_index}. {t.title}</h4>
					<div class="task-meta">
						<span class="badge">{t.type}</span>
						<span>{t.est_minutes} min</span>
						<span class="sep">•</span>
						<span>Due: {t.due_date}</span>
					</div>
					{#if t.resource_ref}
						<div style="margin-top:.6rem">
							<a class="resource_btn" href={t.resource_ref} target="_blank" rel="noreferrer"
								>Resource</a
							>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else if error}
	<p class="alert error">{error}</p>
{:else}
	<div class="skel-card"><div class="skel-line skel-title"></div></div>
{/if}

<style>
	:root {
		--border: #30363d;
		/* borders */
		--card: #161b22;
		/* panels/cards */
		--goal: #238636;
		--level: #868123;
		--time: #237286;
		--deadline: #862332;
	}

	.goalColor {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--goal);
		background: var(--card);
		color: var(--goal);
		margin-bottom: 0.2rem;
	}

	.levelColor {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--level);
		background: var(--card);
		color: var(--level);
		margin-bottom: 0.2rem;
	}

	.timeColor {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--time);
		background: var(--card);
		color: var(--time);
		margin-bottom: 0.2rem;
	}

	.deadlineColor {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--deadline);
		background: var(--card);
		color: var(--deadline);
	}
</style>

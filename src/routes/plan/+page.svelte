<script lang="ts">
	import { api } from '$lib/api';
	let goal = 'Learn SQL';
	let level = 'beginner';
	let minutes = 45;
	let deadline = 'in 4 weeks';
	let result: any = null;
	let error: string | null = null;
	let loading = false;

  let saveName = 'My SQL Plan';
  let saveOk: string | null = null;
  let saveErr: string | null = null;

	async function submit() {
		error = null;
		result = null;
		loading = true;
		try {
			result = await api('/plan/generate', {
				method: 'POST',
				body: JSON.stringify({ goal, level, minutes, deadline })
			});
		} catch (e: any) {
			error = e?.message ?? 'Request failed';
		} finally {
			loading = false;
		}
	}

  async function savePlan() {
    if (!result) return;
    saveOk = null; saveErr = null;
    try {
      const payload = {
        name: saveName,
        goal, level, minutes, deadline,
        milestones: result.milestones,
        tasks: result.tasks
      };
      const saved = await api('/plans', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      saveOk = `Saved as "${saved.name}" (id: ${saved.id})`;
    } catch (e: any) {
      saveErr = e?.message ?? 'Save failed';
    }
  }
</script>

<h2>Generate Plan</h2>
<div class="card">
	<div class="row"><label>Goal<input class="input" bind:value={goal} /></label></div>
	<div class="row"><label>Level<input class="input" bind:value={level} /></label></div>
	<div class="row">
		<label
			>Minutes/day<input
				class="input"
				type="number"
				bind:value={minutes}
				min="10"
				max="240"
			/></label
		>
	</div>
	<div class="row">
		<label
			>Deadline<input
				class="input"
				bind:value={deadline}
				placeholder="e.g. in 4 weeks or 2025-11-30"
			/></label
		>
	</div>
	<button class="btn primary" on:click={!loading ? submit : undefined} disabled={loading}>
		{loading ? 'Generating…' : 'Generate'}
	</button>
</div>

{#if error}<p style="color:#ff7a7a">{error}</p>{/if}

<br /><br />

{#if loading}
	<!-- Milestones skeleton -->
	<div class="skel-card" aria-hidden="true">
		<h3>Milestones</h3>
		<div class="skel-gap"></div>
		<div class="skel-line" style="width: 85%;"></div>
		<div class="skel-gap"></div>
		<div class="skel-line" style="width: 72%;"></div>
		<div class="skel-gap"></div>
		<div class="skel-line" style="width: 64%;"></div>
	</div>

	<br />

	<!-- Tasks skeleton grid -->
	<div class="skel-card" aria-hidden="true">
		<h3>Tasks</h3>
		<div class="skel-grid" style="margin-top:.6rem">
			{#each Array(6) as _, i}
				<div class="skel-card">
					<div class="skel-title skel-line"></div>
					<div class="skel-meta">
						<div class="skel-badge skel-line" style="width:80px;"></div>
						<div class="skel-line" style="width:60px;"></div>
						<div class="skel-line" style="width:90px;"></div>
					</div>
					<div class="skel-gap"></div>
					<div class="skel-line" style="width: 40%; height: 10px;"></div>
				</div>
			{/each}
		</div>
	</div>

{:else if result}
  <!-- Milestone card -->
	<div class="card">
		<h3>Milestones</h3>
		<ul>
			{#each result.milestones as m}
				<li>{m}</li>
			{/each}
		</ul>
	</div>

	<br />

  <!-- Tasks skeleton grid -->
	<div class="card">
		<h3>Tasks</h3>
		<div class="grid-auto">
			{#each result.tasks as t, i}
				<div class="task-card">
					<h4 class="task-title">{i + 1}. {t.title}</h4>
					<div class="task-meta">
						<span class="badge">{t.type}</span>
						<span>{t.est_minutes} min</span>
						<span class="sep">•</span>
						<span>Due: {t.due_date}</span>
					</div>
					{#if t.resource_ref}
						<div style="margin-top:.6rem">
							<a class="resource_btn" href={t.resource_ref} target="_blank" rel="noreferrer">
								Resource
							</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

  <br />

  <!-- Saving a plan -->
  <div class="card">
    <h3>Save this plan</h3>
    <div class="row">
      <label>Plan name
        <input class="input" bind:value={saveName} placeholder="e.g. SQL in 4 weeks" />
      </label>
    </div>
    <button class="btn primary" on:click={savePlan}>Save Plan</button>
    {#if saveOk}<p class="alert success" style="margin-top:.6rem">{saveOk}</p>{/if}
    {#if saveErr}<p class="alert error" style="margin-top:.6rem">{saveErr}</p>{/if}
  </div>
{/if}

<script lang="ts">
	import { api } from '$lib/api';
	import { onMount } from 'svelte';
  
	export let params: { id: string };
  
	type Progress = { plan_id: number; total: number; done: number; streak_days: number };
  
	let plan: any = null;
	let progress: Progress | null = null;
	let error: string | null = null;
	let loading = true;
	let loadingProgress = true;
  
	async function load() {
	  loading = true; error = null; progress = null; loadingProgress = true;
	  try {
		// 1) fetch plan
		plan = await api(`/plans/${params.id}`);
		// 2) fetch progress
		progress = await api(`/plans/${params.id}/progress`);
	  } catch (e: any) {
		error = e?.message ?? 'Failed';
	  } finally {
		loading = false;
		loadingProgress = false;
	  }
	}
  
	onMount(load);
  </script>
  
  {#if loading}
	<div class="skel-card"><div class="skel-line skel-title"></div></div>
  {:else if error}
	<p class="alert error">{error}</p>
  {:else if plan}
	<div class="card header-row">
	  <div class="left">
		<h2 class="title">{plan.name}</h2>
		<pre>
  <small class="goalColor">Goal →</small>           {plan.goal} <br />
  <small class="levelColor">Level →</small>          {plan.level} <br />
  <small class="timeColor">Minutes/day →</small>    {plan.minutes} mins <br />
  <small class="deadlineColor">Deadline →</small>       {plan.deadline} <br />
		</pre>
	  </div>
  
	  <div class="right">
		{#if loadingProgress}
		  <span class="badge" aria-hidden="true">…</span>
		{:else if progress}
		  <span class="badge">{progress.done}/{progress.total} done • 🔥 {progress.streak_days} day streak</span>
		{/if}
		<a class="btn primary" href={`/session?planId=${params.id}`}>Start Session</a>
	  </div>
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
				<a class="resource_btn" href={t.resource_ref} target="_blank" rel="noreferrer">Resource</a>
			  </div>
			{/if}
		  </div>
		{/each}
	  </div>
	</div>
  {/if}
  
  <style>
	:root {
	  --border:#30363d; --card:#161b22;
	  --goal:#1fc13f; --level:#d3ca2e; --time:#1eb9df; --deadline:#d3203b;
	}
	.header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
	.title { margin:0 0 .5rem; }
	.right { display:flex; align-items:center; gap:.6rem; }
	.btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; padding:.5rem .8rem; border-radius:.375rem; text-decoration:none; }
	.btn.primary:hover { background:var(--accent-hover); }
  
	.goalColor,.levelColor,.timeColor,.deadlineColor {
	  display:inline-flex; align-items:center; gap:.4rem; font-size:.9rem;
	  padding:.25rem .5rem; border-radius:.5rem; background:var(--card); margin-bottom:.2rem;
	}
	.goalColor{ border:1px solid var(--goal); color:var(--goal); }
	.levelColor{ border:1px solid var(--level); color:var(--level); }
	.timeColor{ border:1px solid var(--time); color:var(--time); }
	.deadlineColor{ border:1px solid var(--deadline); color:var(--deadline); }
  </style>
<script lang="ts">
	import { api } from '$lib/api';
	let goal = '';
	let level = '';
	let minutes = '';
	let deadline = '';
	let result: any = null;
	let error: string | null = null;
	let loading = false;
  
	let saveName = '';
	let saveOk: string | null = null;
	let saveErr: string | null = null;
  
	// --- Thinking UI state ---
	let showThinking = true;
	const steps = [
	  'Analyzing goal & level',
	  'Planning milestones',
	  'Allocating daily tasks',
	  'Checking minutes & pacing',
	  'Validating JSON response'
	];
	let stepIndex = 0;
	let stepTimer: number | null = null;
  
	function startThinking() {
	  stepIndex = 0;
	  stopThinking();
	  // rotate the highlighted step every ~900ms
	  stepTimer = window.setInterval(() => {
		stepIndex = (stepIndex + 1) % steps.length;
	  }, 900);
	}
	function stopThinking() {
	  if (stepTimer) {
		clearInterval(stepTimer);
		stepTimer = null;
	  }
	}
  
	async function submit() {
	  error = null;
	  result = null;
	  loading = true;
	  saveOk = null;
	  saveErr = null;
	  startThinking();
  
	  try {
		result = await api('/plan/generate', {
		  method: 'POST',
		  body: JSON.stringify({ goal, level, minutes, deadline })
		});
	  } catch (e: any) {
		error = e?.message ?? 'Request failed';
	  } finally {
		loading = false;
		stopThinking();
	  }
	}
  
	async function savePlan() {
	  if (!result) return;
	  saveOk = null;
	  saveErr = null;
	  try {
		const payload = {
		  name: saveName,
		  goal,
		  level,
		  minutes,
		  deadline,
		  milestones: result.milestones,
		  tasks: result.tasks
		};
		const saved = await api('/plans', {
		  method: 'POST',
		  body: JSON.stringify(payload)
		});
		saveOk = `Saved as "${saved.name}"`;
	  } catch (e: any) {
		saveErr = e?.message ?? 'Save failed';
	  }
	}
  </script>
  
  <h2>Generate Plan</h2>
  <div class="card">
	<div class="row"><label>Goal<input class="input" bind:value={goal} placeholder="Enter your goal here" /></label></div>
	<div class="row"><label>Level<input class="input" bind:value={level} placeholder="e.g. Beginner, Intermediate..." /></label></div>
	<div class="row"><label>Minutes/day<input class="input" type="number" bind:value={minutes} placeholder="Between 10 - 240 mins" min="10" max="240" /></label></div>
	<div class="row"><label>Deadline<input class="input" bind:value={deadline} placeholder="e.g. in 4 weeks or 2025-11-30" /></label></div>
	<button class="btn primary" on:click={!loading ? submit : undefined} disabled={loading}>
	  {loading ? 'Generating…' : 'Generate'}
	</button>
  </div>
  
  {#if error}<p style="color:#ff7a7a">{error}</p>{/if}
  
  <br /><br />
  
  {#if loading}
	<!-- THINKING BAR (above skeletons) -->
	<div class="thinking card">
	  <div class="thinking-header">
		<div class="chip">
		  <span class="spinner" aria-hidden="true"></span>
		  Thinking
		</div>
		<button class="btn tiny" on:click={() => (showThinking = !showThinking)} aria-expanded={showThinking}>
		  {showThinking ? 'Hide' : 'Show'} details
		</button>
	  </div>
  
	  {#if showThinking}
		<div class="thinking-steps">
		  {#each steps as s, i}
			<div class="step {i === stepIndex ? 'active' : ''}">
			  <span class="dot" aria-hidden="true"></span>
			  <span>{s}</span>
			</div>
		  {/each}
		</div>
		<div class="progress-wrap" aria-hidden="true">
		  <div class="progress-bar"></div>
		</div>
	  {/if}
	</div>

	<br>
  
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
  
	<!-- Tasks -->
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
  
  <style>
	/* Thinking panel */
	.thinking .chip {
	  display: inline-flex;
	  align-items: center;
	  gap: .45rem;
	  font-size: .9rem;
	  padding: .25rem .55rem;
	  border-radius: .5rem;
	  border: 1px solid var(--border);
	  background: var(--card);
	}
	.thinking-header {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  gap: .5rem;
	  margin-bottom: .4rem;
	}
	.btn.tiny {
	  padding: .25rem .5rem;
	  font-size: .85rem;
	  background: var(--btn-bg);
	  border: 1px solid var(--btn-border);
	}
	.btn.tiny:hover { background: var(--btn-hover); }
  
	.spinner {
	  width: 14px; height: 14px;
	  border: 2px solid var(--border);
	  border-top-color: var(--accent);
	  border-radius: 50%;
	  display: inline-block;
	  animation: spin 0.9s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
  
	.thinking-steps {
	  display: grid;
	  gap: .35rem;
	  margin: .35rem 0 .6rem;
	}
	.step {
	  display: flex;
	  align-items: center;
	  gap: .5rem;
	  color: var(--muted);
	  font-size: .95rem;
	}
	.step.active { color: var(--fg); }
	.dot {
	  width: 7px; height: 7px; border-radius: 50%;
	  background: var(--border);
	}
	.step.active .dot { background: var(--accent); }
  
	.progress-wrap {
	  position: relative;
	  height: 4px;
	  border-radius: 999px;
	  background: var(--border);
	  overflow: hidden;
	}
	.progress-bar {
	  position: absolute;
	  inset: 0;
	  transform: translateX(-100%);
	  animation: indet 1.4s ease-in-out infinite;
	  background: linear-gradient(90deg, transparent, var(--accent), transparent);
	}
	@keyframes indet {
	  0%   { transform: translateX(-100%); }
	  50%  { transform: translateX(-10%); }
	  100% { transform: translateX(100%); }
	}
  
	/* Skeleton styles assumed already exist in your global CSS:
	   .skel-card, .skel-line, .skel-gap, .skel-grid, .skel-badge, .skel-title, .skel-meta
	   If not, we can paste them here too. */
  </style>
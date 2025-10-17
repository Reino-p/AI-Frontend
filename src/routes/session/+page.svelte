<script lang="ts">
	import { api } from '$lib/api';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';

	type TodayTask = {
		id: number;
		title: string;
		type: string;
		est_minutes: number;
		due_date: string; // string is fine; backend sends ISO-ish
		resource_ref?: string;
	};

	let planId: number | null = null;
	let tasks: TodayTask[] = [];
	let loading = true;
	let error: string | null = null;

	// filter: which set to show?
	let scope: 'today' | 'upcoming' | 'all' = 'today';

	// timer + session
	let running = false;
	let seconds = 0;
	let timer: number | null = null;
	let sessionId: number | null = null;

	// per-task action guard
	let actingOn: number | null = null;

	// Reflection modal state
	let showReflect = false;
	let targetTask: TodayTask | null = null;

	let confidence = 3;
	let blockers = '';
	let took_minutes: number | '' = '';
	let want_more_practice = false;

	function mmss(n: number) {
		const m = Math.floor(n / 60)
			.toString()
			.padStart(2, '0');
		const s = (n % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	async function ensureSession() {
		if (!planId) return;
		const active = await api(`/sessions/active?plan_id=${planId}`);
		if (active?.id) {
			sessionId = active.id;
			return;
		}
		const created = await api(`/sessions/start?plan_id=${planId}`, { method: 'POST' });
		sessionId = created.id;
	}

	async function endSession() {
		if (!sessionId) return;
		await api(`/sessions/${sessionId}/end`, { method: 'POST' }, { expectJson: false });
		sessionId = null;
	}

	async function startTimer() {
		if (running) return;
		await ensureSession();
		running = true;
		timer = window.setInterval(() => (seconds += 1), 1000);
	}
	function pauseTimer() {
		running = false;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}
	function resetTimer() {
		pauseTimer();
		seconds = 0;
	}
	async function hardStop() {
		pauseTimer();
		await endSession();
	}

	function openReflect(t: TodayTask) {
		targetTask = t;
		confidence = 3;
		blockers = '';
		took_minutes = '';
		want_more_practice = false;
		showReflect = true;
	}

	function closeReflect() {
		showReflect = false;
		targetTask = null;
	}

	async function submitReflection() {
		if (!targetTask) return;
		try {
			actingOn = targetTask.id;
			await ensureSession();
            const completedId = targetTask.id;
			await api(
				`/tasks/${targetTask.id}/complete`,
				{
					method: 'POST',
					body: JSON.stringify({
						outcome: 'done',
						rating: 5,
						session_id: sessionId,
						reflection: {
							confidence,
							blockers: blockers || null,
							took_minutes: took_minutes === '' ? null : Number(took_minutes),
							want_more_practice
						}
					})
				},
				{ expectJson: true } // we now return actions/tips if you want to toast them
			);
            tasks = tasks.filter((x) => x.id !== completedId);
			closeReflect();
			await load();
		} catch (e: any) {
			error = e?.message ?? 'Complete failed';
		} finally {
			actingOn = null;
		}
	}

	async function load() {
		loading = true;
		error = null;
		tasks = [];
		try {
			const urlPlan = new URLSearchParams($page.url.search).get('planId');
			if (!urlPlan) throw new Error('Missing ?planId= in URL');
			planId = Number(urlPlan);

			// scope-aware fetch
			// backend supports /plans/{id}/today?scope=today|upcoming|all
			const out = await api(`/plans/${planId}/today?scope=${scope}`);
			tasks = out.tasks ?? [];
		} catch (e: any) {
			error = e?.message ?? 'Failed to load tasks';
		} finally {
			loading = false;
		}
	}

	async function markDone(t: TodayTask) {
		try {
			actingOn = t.id;
			await ensureSession();
			await api(
				`/tasks/${t.id}/complete`,
				{
					method: 'POST',
					body: JSON.stringify({ outcome: 'done', rating: 5, session_id: sessionId })
				},
				{ expectJson: false }
			);
			// optimistic remove, then refresh from server to pick up any re-ranking
			tasks = tasks.filter((x) => x.id !== t.id);
			await load();
		} catch (e: any) {
			error = e?.message ?? 'Complete failed';
		} finally {
			actingOn = null;
		}
	}

	async function skip(t: TodayTask) {
		try {
			actingOn = t.id;
			await ensureSession();
			await api(
				`/tasks/${t.id}/complete`,
				{ method: 'POST', body: JSON.stringify({ outcome: 'skipped', session_id: sessionId }) },
				{ expectJson: false }
			);
			tasks = tasks.filter((x) => x.id !== t.id);
			await load();
		} catch (e: any) {
			error = e?.message ?? 'Skip failed';
		} finally {
			actingOn = null;
		}
	}

	// reload when scope changes
	$: (async () => {
		if (planId !== null) await load();
	})();

	onMount(load);
	onDestroy(() => {
		if (running) pauseTimer();
	});
</script>

<h2>Focus Session</h2>

<!-- small scope switcher -->
<div class="card scope">
	<div class="seg">
		<button
			class="seg-btn {scope === 'today' ? 'active' : ''}"
			on:click={() => {
				scope = 'today';
				load();
			}}>Today</button
		>
		<button
			class="seg-btn {scope === 'upcoming' ? 'active' : ''}"
			on:click={() => {
				scope = 'upcoming';
				load();
			}}>Upcoming</button
		>
		<button
			class="seg-btn {scope === 'all' ? 'active' : ''}"
			on:click={() => {
				scope = 'all';
				load();
			}}>All</button
		>
	</div>
</div>
<br />

<div class="card timer">
	<div class="time">{mmss(seconds)}</div>
	<div class="controls">
		<button class="btn" on:click={startTimer} disabled={running}>Start</button>
		<button class="btn" on:click={pauseTimer} disabled={!running}>Pause</button>
		<button class="btn" on:click={resetTimer}>Reset</button>
		<button class="btn" on:click={hardStop} disabled={!sessionId}>End Session</button>
	</div>
	{#if planId}<small>Plan #{planId}</small>{/if}
</div>
<br />

{#if loading}
	<div class="skel-card" aria-hidden="true" style="height:96px">
		<div class="skel-title skel-line" style="width:50%"></div>
		<div class="skel-gap"></div>
		<div class="skel-line" style="width:70%"></div>
	</div>
{:else if error}
	<p class="alert error">{error}</p>
{:else if tasks.length === 0}
	<div class="card"><p>No tasks in this view. 🎉</p></div>
{:else}
	<div class="grid-auto">
		{#each tasks as t}
			<div class="task-card">
				<h4 class="task-title">{t.title}</h4>
				<div class="task-meta">
					<span class="badge">{t.type}</span>
					<span>{t.est_minutes} min</span>
					<span class="sep">•</span>
					<span>Due: {t.due_date}</span>
				</div>
				{#if t.resource_ref}
					<div style="margin-top:.6rem">
						<a class="resource_btn" href={t.resource_ref} target="_blank" rel="noreferrer"
							>Open resource</a
						>
					</div>
				{/if}
				<div class="actions">
					<button class="btn primary" on:click={() => openReflect(t)} disabled={actingOn === t.id}
						>Mark done</button
					>
					<button class="btn" on:click={() => skip(t)} disabled={actingOn === t.id}>Skip</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<svelte:window
	on:keydown={(e) => {
		if (showReflect && e.key === 'Escape') closeReflect();
	}}
/>

<!-- Reflection Modal -->
{#if showReflect}
	<!-- Backdrop acts like a button: focusable + keyboard-close -->
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		aria-label="Close dialog"
		on:click|self={closeReflect}
		on:keydown={(e) => {
			// allow Enter/Space to close when the backdrop has focus
			if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
				e.preventDefault();
				closeReflect();
			}
		}}
	>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="reflectTitle">
			<div class="modal-head">
				<h3 id="reflectTitle">Quick reflection</h3>
				<button class="icon-btn" on:click={closeReflect} aria-label="Close dialog">×</button>
			</div>

			<p style="margin-top:.25rem"><small>This helps tailor your plan.</small></p>

			<div class="row" style="margin-top:.6rem">
				<label>
					Confidence (1-5)
					<input class="input" type="number" min="1" max="5" bind:value={confidence} />
				</label>
			</div>

			<div class="row">
				<label>
					Blockers (optional)
					<input class="input" placeholder="What made this hard?" bind:value={blockers} />
				</label>
			</div>

			<div class="row">
				<label>
					Time spent (mins, optional)
					<input class="input" type="number" min="1" max="600" bind:value={took_minutes} />
				</label>
			</div>

			<div class="row" style="display:flex; align-items:center; gap:.5rem">
				<input id="more" type="checkbox" bind:checked={want_more_practice} />
				<label for="more">I want more practice like this</label>
			</div>

			<div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:.6rem">
				<button class="btn" on:click={closeReflect} disabled={actingOn !== null}>Cancel</button>
				<button class="btn primary" on:click={submitReflection} disabled={actingOn !== null}>
					Save & Complete
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.timer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.time {
		font-size: 1.8rem;
		font-weight: 700;
		letter-spacing: 1px;
	}
	.controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.actions {
		margin-top: 0.8rem;
		display: flex;
		gap: 0.5rem;
	}
	.scope {
		display: flex;
		justify-content: flex-start;
	}
	.seg {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
	}
	.seg-btn {
		background: var(--card);
		border: none;
		padding: 0.4rem 0.7rem;
		color: var(--fg);
		cursor: pointer;
	}
	.seg-btn + .seg-btn {
		border-left: 1px solid var(--border);
	}
	.seg-btn.active {
		background: var(--btn-hover);
	}
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: grid;
		place-items: center;
		z-index: 50;
	}
	.modal {
		width: min(520px, 92vw);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 1rem;
	}
	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.icon-btn {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--fg);
		border-radius: 0.375rem;
		padding: 0.1rem 0.45rem;
		line-height: 1;
		cursor: pointer;
	}
	.icon-btn:hover {
		background: var(--btn-hover);
	}
</style>

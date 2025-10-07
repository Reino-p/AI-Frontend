<script lang="ts">
  import { api } from '$lib/api';
  let goal = 'Learn SQL';
  let level = 'beginner';
  let minutes = 45;
  let deadline = 'in 4 weeks';
  let result: any = null;
  let error: string | null = null;
  let loading = false;

  async function submit() {
    error = null; result = null; loading = true;
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
</script>
  
<h2>Generate Plan</h2>
<div class="card">
  <div class="row"><label>Goal<input class="input" bind:value={goal} /></label></div>
  <div class="row"><label>Level<input class="input" bind:value={level} /></label></div>
  <div class="row"><label>Minutes/day<input class="input" type="number" bind:value={minutes} min="10" max="240" /></label></div>
  <div class="row"><label>Deadline<input class="input" bind:value={deadline} placeholder="e.g. in 4 weeks or 2025-11-30" /></label></div>
  <button class="btn" on:click={submit} disabled={loading}>{loading ? 'Generating…' : 'Generate'}</button>
</div>
  
{#if error}<p style="color:#ff7a7a">{error}</p>{/if}
  
{#if result}
  <div class="card">
    <h3>Milestones</h3>
    <ul>{#each result.milestones as m}<li>{m}</li>{/each}</ul>
    <h3 style="margin-top:1rem">Tasks</h3>
    <ul>
      {#each result.tasks as t}
        <li><strong>{t.title}</strong> — {t.type} • {t.est_minutes}m • {t.due_date}
        {#if t.resource_ref} — <a href={t.resource_ref} target="_blank" rel="noreferrer">resource</a>{/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}
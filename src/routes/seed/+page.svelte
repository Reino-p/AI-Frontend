<script lang="ts">
    import { api } from '$lib/api';
    let title = 'Intro to SQL';
    let text = 'Relational databases use tables, rows, and columns...';
    let tags = 'sql,intro';
    let createdId: number | null = null;
    let error: string | null = null;
  
    async function seed() {
      error = null; createdId = null;
      try {
        const out = await api<{ id: number }>('/__seed', {
          method: 'POST',
          body: JSON.stringify({ title, text, tags })
        });
        createdId = out.id;
      } catch (e: any) {
        error = e?.message ?? 'Failed';
      }
    }
  </script>
  
  <h2>Seed Database</h2>
  <div class="card">
    <div class="row"><label>Title<input class="input" bind:value={title} /></label></div>
    <div class="row"><label>Tags<input class="input" bind:value={tags} /></label></div>
    <div class="row"><label>Text<textarea class="textarea" rows="6" bind:value={text}></textarea></label></div>
    <button class="btn" on:click={seed}>Insert Row</button>
  </div>
  
  {#if createdId}<p class="card">✅ Inserted with id <strong>{createdId}</strong></p>{/if}
  {#if error}<p style="color:#ff7a7a">{error}</p>{/if}
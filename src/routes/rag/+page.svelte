<script lang="ts">
    import { api } from '$lib/api';
    let query = 'What is a SQL JOIN?';
    let hits: { id:number; title:string; snippet:string }[] = [];
    let error: string | null = null;
  
    async function search() {
      error = null; hits = [];
      // Wire this once you add /rag/search on the backend:
      // const out = await api<{hits: typeof hits}>('/rag/search', { method:'POST', body: JSON.stringify({ query, top_k: 6 }) });
      // hits = out.hits;
      alert('RAG endpoint not implemented yet — we’ll wire it next!');
    }
  </script>
  
  <h2>RAG Search (Coming Soon)</h2>
  <div class="card">
    <div class="row"><label>Query<input class="input" bind:value={query} /></label></div>
    <button class="btn" on:click={search}>Search</button>
  </div>
  
  {#if hits.length}
    <div class="card">
      <ul>{#each hits as h}<li><strong>{h.title}</strong><br/>{h.snippet}</li>{/each}</ul>
    </div>
  {/if}
  {#if error}<p style="color:#ff7a7a">{error}</p>{/if}
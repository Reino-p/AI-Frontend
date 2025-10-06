<script lang="ts">
    import { API } from '$lib/api';
    let healthy: string | null = null;
  
    async function check() {
      try {
        const res = await fetch(`${API}/health`);
        healthy = res.ok ? 'OK' : 'DOWN';
      } catch { healthy = 'DOWN'; }
    }
    check();
  </script>
  
  <h1>Agentic Tutor</h1>
  <p>Welcome! Choose an action below.</p>
  
  <div class="grid">
    <a class="card" href="/plan">
      <h3>Generate Plan →</h3>
      <p>Create milestones & tasks using your Planner agent.</p>
      <small>POST /plan/generate</small>
    </a>
    <a class="card" href="/seed">
      <h3>Seed Database →</h3>
      <p>Insert sample content rows into Postgres (pgvector enabled).</p>
      <small>POST /__seed</small>
    </a>
    <a class="card" href="/rag">
      <h3>RAG Search (soon) →</h3>
      <p>Query your embedded content with vector search.</p>
      <small>POST /rag/search</small>
    </a>
  </div>
  
  <div class="card" style="margin-top:1rem">
    <strong>Backend health:</strong> {healthy ?? '…checking'}  
    <div><small>API: {API}</small></div>
  </div>
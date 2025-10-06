<script lang="ts">
  import '../app.css';
</script>

<nav class="nav">
  <a href="/">Home</a>
  <a href="/plan">Plan</a>
  <a href="/seed">Seed DB</a>
  <a href="/rag">RAG (soon)</a>
</nav>

<main class="container">
  <slot />
</main>

<footer class="footer">Agentic Tutor • SvelteKit + FastAPI</footer>
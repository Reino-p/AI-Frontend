<script lang="ts">
	import '../app.css';
	import { API } from '$lib/api';
	import logoDark from '$lib/assets/dark-logo-32.png';
	import logoLight from '$lib/assets/light-logo.png';
	import { afterNavigate } from '$app/navigation';
  
	let healthy: 'OK' | 'DOWN' | null = null;
	let open = false;
  
	async function check() {
	  try {
		const res = await fetch(`${API}/health`);
		healthy = res.ok ? 'OK' : 'DOWN';
	  } catch {
		healthy = 'DOWN';
	  }
	}
	check();
  
	// Close mobile menu on route change
	afterNavigate(() => (open = false));
  
	function toggle() {
	  open = !open;
	}
  
	// Close on ESC globally
	function onKey(e: KeyboardEvent) {
	  if (e.key === 'Escape') open = false;
	}
  </script>
  
  <svelte:window on:keydown={onKey} />
  
  <nav class="nav nav-bar">
	<!-- Left: Logo + desktop links -->
	<div class="nav-left">
	  <a href="/" class="brand">
		<img src={logoDark} alt="Agentic Tutor logo" class="logo" />
		<span class="brand-text">Nexus Mind</span>
	  </a>
  
	  <!-- Desktop links -->
	  <div class="menu-desktop">
		<a href="/">Home</a>
		<a href="/plan">Plan</a>
		<a href="/plans">Saved Plans</a>
		<a href="/seed">Seed DB</a>
		<a href="/rag">RAG Search</a>
	  </div>
	</div>
  
	<!-- Right: server chip (desktop) + hamburger (mobile) -->
	<div class="nav-right">
	  <span
		class="status status-desktop {healthy === 'OK' ? 'ok' : 'down'}"
		title={API}
		aria-live="polite"
	  >
		{#if healthy === 'OK'}<span>●</span> Server
		{:else if healthy === 'DOWN'}<span>●</span> Server
		{:else}…checking
		{/if}
	  </span>
  
	  <!-- Hamburger button (mobile only) -->
	  <button
		class="menu-btn"
		type="button"
		aria-label="Toggle navigation"
		aria-controls="mobile-menu"
		aria-expanded={open}
		on:click={toggle}
	  >
		{#if !open}
		  <!-- hamburger icon -->
		  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
		  </svg>
		{:else}
		  <!-- close icon -->
		  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3l1.4 1.4Z" />
		  </svg>
		{/if}
	  </button>
	</div>
  </nav>
  
  <!-- Mobile slide-down panel -->
  {#if open}
	<div id="mobile-menu" class="mobile-panel">
	  <a href="/" class="mobile-link">Home</a>
	  <a href="/plan" class="mobile-link">Plan</a>
	  <a href="/plans" class="mobile-link">Saved Plans</a>
	  <a href="/seed" class="mobile-link">Seed DB</a>
	  <a href="/rag" class="mobile-link">RAG Search</a>
  
	  <div class="mobile-status">
		<span class="status {healthy === 'OK' ? 'ok' : 'down'}" title={API} aria-live="polite">
		  {#if healthy === 'OK'}<span>●</span> Server
		  {:else if healthy === 'DOWN'}<span>●</span> Server
		  {:else}…checking
		  {/if}
		</span>
	  </div>
	</div>
  {/if}
  
  <main class="container">
	<slot />
  </main>
  
  <footer class="footer">Agentic Tutor • SvelteKit + FastAPI</footer>
  
  <style>
	.nav-bar {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	}
	.nav-left {
	  display: flex;
	  align-items: center;
	  gap: .75rem;
	}
	.brand {
	  display: inline-flex;
	  align-items: center;
	  gap: .5rem;
	  color: var(--fg);
	  text-decoration: none;
	  padding: .35rem .6rem;
	  border-radius: .375rem;
	}
	.brand:hover { background: var(--card-hover); text-decoration: none; }
	.brand-text { font-weight: 600; }
  
	.logo { width: 32px; height: 32px; border-radius: .25rem; }
  
	/* Desktop link group */
	.menu-desktop {
	  display: none;
	  gap: 1rem;
	  margin-left: .25rem;
	}
  
	.nav-right {
	  display: flex;
	  align-items: center;
	  gap: .5rem;
	}
  
	/* Status chip only on desktop here */
	.status-desktop { display: none; }
  
	/* Hamburger button (mobile only) */
	.menu-btn {
	  display: inline-flex;
	  align-items: center;
	  justify-content: center;
	  height: 34px; width: 34px;
	  border-radius: .4rem;
	  border: 1px solid var(--border);
	  background: var(--card);
	  color: var(--fg);
	  cursor: pointer;
	}
	.menu-btn:hover { background: var(--card-hover); }
  
	/* Mobile panel */
	.mobile-panel {
	  border-bottom: 1px solid var(--border);
	  background: var(--card);
	  display: grid;
	  gap: .25rem;
	  padding: .5rem .75rem .75rem;
	}
	.mobile-link {
	  display: block;
	  padding: .55rem .6rem;
	  border-radius: .4rem;
	  color: var(--fg);
	  text-decoration: none;
	}
	.mobile-link:hover {
	  background: var(--card-hover);
	  text-decoration: none;
	}
	.mobile-status { margin-top: .35rem; }
  
	/* ≥ 768px: show desktop nav, hide mobile panel & hamburger */
	@media (min-width: 768px) {
	  .menu-desktop { display: inline-flex; }
	  .status-desktop { display: inline-flex; }
	  .menu-btn { display: none; }
	  /* the mobile panel is not rendered at all on desktop due to {#if open} */
	}
  </style>
<script lang="ts">
  //script tag
</script>

<h1>Agentic Tutor</h1>
<p style="color: var(--muted)">
	Agentic Tutor is your personal study copilot. It creates a tailored learning plan for your goal,
	schedules realistic tasks against your timeline, and lets you save and revisit plans any time.
	Coming soon: search across your own docs with AI-powered RAG.
</p> <br>

<div class="grid" style="margin-top:1rem">
	<a class="card" href="/plan">
		<h3>Generate Plan →</h3>
		<p>Create a milestone-driven study plan with actionable tasks and due dates.</p>
	</a>

	<a class="card" href="/plans">
		<h3>Saved Plans →</h3>
		<p>View or manage the plans you’ve saved for later.</p>
	</a>

	<a class="card" href="/seed">
		<h3>Seed Database →</h3>
		<p>Insert sample content for testing (developer utility).</p>
	</a>

	<a class="card" href="/rag">
		<h3>RAG Search (soon) →</h3>
		<p>Ask questions across your uploaded notes and resources.</p>
	</a>
</div>
<br>
<!-- Optional: a subtle “How it helps” block -->
<div class="card" style="margin-top:1rem">
	<h3>Why it's helpful</h3>
	<ul style="margin: .25rem 0 0 1rem; line-height: 1.6">
		<li>Turns broad goals into concrete milestones and daily tasks</li>
		<li>Builds schedules from <em>today</em> toward your deadline</li>
		<li>Stores multiple plans so you can switch contexts quickly</li>
	</ul>
</div>

<style>
	/* local tweaks for the home page */
	h1 {
		margin-bottom: 0.25rem;
	}
	.grid a.card {
		color: var(--fg);
		text-decoration: none;
	}
	.grid a.card:hover {
		background: var(--card-hover);
		text-decoration: none;
	}
	.grid a.card p {
		color: var(--muted);
	}
</style>

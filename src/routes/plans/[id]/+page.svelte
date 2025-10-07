<script lang="ts">
    import { api } from '$lib/api';
    export let params: { id: string };
    let plan: any = null;
    let error: string | null = null;
  
    (async () => {
      try { plan = await api(`/plans/${params.id}`); }
      catch (e:any) { error = e?.message ?? 'Failed'; }
    })();
  </script>
  
  {#if plan}
    <div class="card">
      <h2>{plan.name}</h2>
      <p><small>Goal:</small> {plan.goal} • <small>Level:</small> {plan.level} • <small>Minutes/day:</small> {plan.minutes} • <small>Deadline:</small> {plan.deadline}</p>
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
  {:else if error}
    <p class="alert error">{error}</p>
  {:else}
    <div class="skel-card"><div class="skel-line skel-title"></div></div>
  {/if}
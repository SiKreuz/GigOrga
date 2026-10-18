<script lang="ts">
  import type { Component, Snippet } from "svelte";

  let {
    id,
    title,
    icon: Icon,
    description,
    children,
    actions,
  }: {
    id: string;
    title: string;
    icon: Component<{ class?: string }>;
    description?: string;
    children: Snippet;
    actions?: Snippet;
  } = $props();
</script>

<section {id} class="card">
  <div class="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
    >
      <Icon class="size-4" />
    </span>
    <div class="min-w-0 flex-1">
      <h2 class="font-semibold tracking-tight">{title}</h2>
      {#if description}
        <p class="text-xs text-muted">{description}</p>
      {/if}
    </div>
    {#if actions}
      {@render actions()}
    {/if}
  </div>
  <div class="p-5 sm:p-6">
    {@render children()}
  </div>
</section>

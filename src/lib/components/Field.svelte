<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    id,
    label,
    error,
    hint,
    children,
  }: { id: string; label: string; error?: string; hint?: string; children: Snippet } = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label for={id} class="text-sm font-medium">{label}</label>
  {@render children()}
  {#if error}
    <span class="text-sm text-danger">{error}</span>
  {:else if hint}
    <span class="text-xs text-muted">{hint}</span>
  {/if}
</div>

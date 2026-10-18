<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label,
    children,
    wide = false,
  }: { label: string; children: Snippet; wide?: boolean } = $props();
</script>

<div class={[wide && "sm:col-span-2"]}>
  <dt class="text-xs text-muted">{label}</dt>
  <dd class="mt-0.5 text-sm whitespace-pre-line">{@render children()}</dd>
</div>

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    message,
    label,
    formaction,
    children,
  }: { message: string; label: string; formaction?: string; children?: Snippet } = $props();

  function onclick(event: MouseEvent) {
    if (!confirm(message)) event.preventDefault();
  }
</script>

<button type="submit" class="btn h-9 btn-danger px-3" {formaction} {onclick} aria-label={label}>
  {#if children}
    {@render children()}
  {:else}
    {label}
  {/if}
</button>

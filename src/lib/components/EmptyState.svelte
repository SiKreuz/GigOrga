<script lang="ts">
  import { CalendarX } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  let {
    title,
    description,
    children,
  }: { title: string; description?: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
  <div
    class="mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent"
  >
    <CalendarX class="size-5" />
  </div>
  <h2 class="font-medium">{title}</h2>
  {#if description}
    <p class="mt-1 max-w-sm text-sm text-muted">{description}</p>
  {/if}
  {#if children}
    <div class="mt-6">{@render children()}</div>
  {/if}
</div>

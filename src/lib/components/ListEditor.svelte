<script lang="ts" generics="T extends object">
  import { ArrowDown, ArrowUp, Plus, Trash2 } from "@lucide/svelte";
  import { type Snippet, untrack } from "svelte";

  let {
    name,
    initial,
    blank,
    row,
    addLabel,
    emptyText,
    footer,
  }: {
    name: string;
    initial: T[];
    blank: () => T;
    row: Snippet<[T, number]>;
    addLabel: string;
    emptyText?: string;
    footer?: Snippet<[T[]]>;
  } = $props();

  let rows = $state(untrack(() => initial.map((item) => ({ ...item }))));

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= rows.length) return;
    [rows[index], rows[target]] = [rows[target] as T, rows[index] as T];
  }
</script>

<input type="hidden" {name} value={JSON.stringify(rows)} />

<div class="flex flex-col gap-2">
  {#each rows as item, index (item)}
    <div class="flex items-start gap-1 rounded-lg border border-border bg-bg p-2 sm:gap-2">
      <div class="min-w-0 flex-1">{@render row(item, index)}</div>
      <div class="flex shrink-0 flex-col sm:flex-row">
        <button
          type="button"
          class="btn-icon"
          onclick={() => move(index, -1)}
          aria-label="Nach oben"
          disabled={index === 0}
        >
          <ArrowUp class="size-4" />
        </button>
        <button
          type="button"
          class="btn-icon"
          onclick={() => move(index, 1)}
          aria-label="Nach unten"
          disabled={index === rows.length - 1}
        >
          <ArrowDown class="size-4" />
        </button>
        <button
          type="button"
          class="btn-icon hover:text-danger"
          onclick={() => rows.splice(index, 1)}
          aria-label="Entfernen"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </div>
  {:else}
    {#if emptyText}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted"
      >
        {emptyText}
      </p>
    {/if}
  {/each}
  <div>
    <button type="button" class="btn h-9 btn-ghost px-3" onclick={() => rows.push(blank())}>
      <Plus class="size-4" />
      {addLabel}
    </button>
  </div>
  {@render footer?.(rows)}
</div>

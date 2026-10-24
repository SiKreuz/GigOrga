<script lang="ts">
  import ListEditor from "$lib/components/ListEditor.svelte";
  import Section from "$lib/components/Section.svelte";
  import { timesOf } from "$lib/daysheet";
  import { timetableKinds } from "$lib/labels";
  import type { GigDetail, TimetableRow } from "$lib/server/services/gigs";
  import { Clock, Lock, LockOpen } from "@lucide/svelte";

  let {
    gig,
    errors,
    editing = $bindable(false),
  }: { gig: GigDetail; errors: Record<string, string>; editing?: boolean } = $props();

  const blank = (): TimetableRow => ({
    kind: "sonstiges",
    start: "",
    end: "",
    label: "",
    fixed: 0,
  });
  const filled = $derived(timesOf(gig));
</script>

<Section id="zeitplan" title="Zeitplan" icon={Clock} action="?/timetable" bind:editing>
  {#snippet summary()}
    {#if filled.length > 0}
      <ol class="flex flex-col gap-1.5">
        {#each filled as entry (entry.id)}
          <li
            class={[
              "flex items-baseline gap-3 text-sm",
              entry.fixed && "font-semibold text-accent",
            ]}
          >
            <span class="w-24 shrink-0 tabular-nums">
              {entry.start}{entry.end ? `–${entry.end}` : ""}
            </span>
            <span class="flex items-center gap-1.5">
              {timetableKinds[entry.kind]}
              {#if entry.fixed}<Lock class="size-3" />{/if}
            </span>
            {#if entry.label}<span class="font-normal text-muted">{entry.label}</span>{/if}
          </li>
        {/each}
      </ol>
    {:else}
      <p class="text-sm text-muted">Noch keine Zeiten eingetragen.</p>
    {/if}
  {/snippet}
  {#snippet form()}
    <p class="text-xs text-muted">
      Verbindliche Zeiten (Schloss) sind vom Veranstalter fix vorgegeben.
    </p>
    <ListEditor name="entries" initial={gig.timetable} {blank} addLabel="Zeile hinzufügen">
      {#snippet row(item: TimetableRow)}
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-[10rem_7rem_7rem_1fr_auto]">
          <select class="col-span-2 input sm:col-span-1" bind:value={item.kind} aria-label="Art">
            {#each Object.entries(timetableKinds) as [key, text] (key)}
              <option value={key}>{text}</option>
            {/each}
          </select>
          <input
            type="time"
            class={["input", item.fixed && "border-accent font-semibold text-accent"]}
            bind:value={item.start}
            aria-label="Beginn"
          />
          <input type="time" class="input" bind:value={item.end} aria-label="Ende" />
          <input
            class="col-span-2 input sm:col-span-1"
            bind:value={item.label}
            placeholder="Notiz"
            aria-label="Notiz"
          />
          <button
            type="button"
            class={[
              "col-span-2 btn h-10 px-3 sm:col-span-1",
              item.fixed ? "bg-accent-soft text-accent" : "btn-ghost text-muted",
            ]}
            onclick={() => (item.fixed = item.fixed ? 0 : 1)}
            aria-pressed={item.fixed === 1}
            title="Verbindlich"
          >
            {#if item.fixed}<Lock class="size-4" />{:else}<LockOpen class="size-4" />{/if}
            <span class="sm:hidden">{item.fixed ? "Verbindlich" : "Flexibel"}</span>
          </button>
        </div>
      {/snippet}
    </ListEditor>
    {#if errors.entries}<span class="text-sm text-danger">{errors.entries}</span>{/if}
  {/snippet}
</Section>

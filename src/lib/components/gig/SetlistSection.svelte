<script lang="ts">
  import { resolve } from "$app/paths";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import Section from "$lib/components/Section.svelte";
  import type { GigDetail } from "$lib/server/services/gigs";
  import type { SetlistEntry, SongSummary } from "$lib/server/services/songs";
  import { formatSongDuration, overrun, slotOf } from "$lib/setlist";
  import { ListMusic, Printer } from "@lucide/svelte";

  let {
    gig,
    songs,
    setlist,
    errors,
    editing = $bindable(false),
  }: {
    gig: GigDetail;
    songs: SongSummary[];
    setlist: SetlistEntry[];
    errors: Record<string, string>;
    editing?: boolean;
  } = $props();

  type Row = { songId: string };

  const slot = $derived(slotOf(gig));
  const durations = $derived(new Map(songs.map((song) => [song.id, song.durationSec])));
  const totalOf = (rows: Row[]) =>
    rows.reduce((sum, row) => sum + (durations.get(row.songId) ?? 0), 0);
  const blank = (): Row => ({ songId: songs[0]?.id ?? "" });
</script>

{#snippet totals(total: number)}
  {@const over = overrun(total, slot)}
  <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-3 text-sm">
    <span>Gesamt <strong class="tabular-nums">{formatSongDuration(total)}</strong></span>
    {#if slot !== null}
      <span class="text-muted"
        >Slot <span class="tabular-nums">{formatSongDuration(slot)}</span></span
      >
    {/if}
    {#if over !== null}
      <span class="font-semibold text-danger">
        <span class="tabular-nums">+{formatSongDuration(over)}</span> über dem Slot
      </span>
    {/if}
  </div>
{/snippet}

<Section id="setlist" title="Setlist" icon={ListMusic} action="?/setlist" bind:editing>
  {#snippet summary()}
    <ol class="flex flex-col gap-1.5 text-sm">
      {#each setlist as entry, index (index)}
        <li class="flex items-baseline gap-3">
          <span class="w-6 shrink-0 text-right text-muted tabular-nums">{index + 1}.</span>
          <span class="flex-1">{entry.title}</span>
          <span class="text-muted tabular-nums">{formatSongDuration(entry.durationSec)}</span>
        </li>
      {/each}
    </ol>
    <div class="mt-3">{@render totals(totalOf(setlist))}</div>
    <a href={resolve("/gigs/[id]/setlist", { id: gig.id })} class="mt-3 btn h-9 btn-ghost px-3">
      <Printer class="size-4" /> Drucken
    </a>
  {/snippet}
  {#snippet form()}
    {#if songs.length === 0}
      <p class="text-sm text-muted">
        Noch keine Songs angelegt. <a href={resolve("/songs")} class="text-accent hover:underline"
          >Songs anlegen</a
        >
      </p>
    {:else}
      <ListEditor
        name="songs"
        initial={setlist.map(({ songId }) => ({ songId }))}
        {blank}
        addLabel="Song hinzufügen"
      >
        {#snippet row(item: Row)}
          <div class="flex items-center gap-3">
            <select class="input min-w-0 flex-1" bind:value={item.songId} aria-label="Song">
              {#each songs as song (song.id)}
                <option value={song.id}>{song.title}</option>
              {/each}
            </select>
            <span class="w-12 shrink-0 text-right text-sm text-muted tabular-nums">
              {formatSongDuration(durations.get(item.songId) ?? 0)}
            </span>
          </div>
        {/snippet}
        {#snippet footer(rows: Row[])}
          {@render totals(totalOf(rows))}
        {/snippet}
      </ListEditor>
    {/if}
    {#if errors.songs}<span class="text-sm text-danger">{errors.songs}</span>{/if}
  {/snippet}
</Section>

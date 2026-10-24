<script lang="ts">
  import { formatSongDuration, slotOf } from "$lib/setlist";
  import { ArrowLeft, Printer } from "@lucide/svelte";

  let { data } = $props();

  const gig = $derived(data.gig);
  const total = $derived(data.setlist.reduce((sum, entry) => sum + entry.durationSec, 0));
  const show = $derived(gig.timetable.find((entry) => entry.kind === "show" && entry.start));
  const slot = $derived(slotOf(gig));
  const date = $derived(
    new Date(`${gig.date}T00:00:00Z`).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  );
</script>

<svelte:head>
  <title>Setlist {gig.title} · GigOrga</title>
</svelte:head>

<div class="mx-auto flex max-w-[210mm] flex-col gap-4 print:max-w-none">
  <div class="flex items-center justify-between gap-3 print:hidden">
    <a
      href="/gigs/{gig.id}"
      class="inline-flex items-center gap-1 text-sm text-muted hover:text-text"
    >
      <ArrowLeft class="size-4" />
      {gig.title}
    </a>
    {#if data.setlist.length > 0}
      <button class="btn btn-primary" onclick={() => print()}>
        <Printer class="size-4" /> Drucken
      </button>
    {/if}
  </div>

  {#if data.setlist.length === 0}
    <p class="card p-6 text-sm text-muted">
      Für diesen Gig gibt es noch keine Setlist.
      <a href="/gigs/{gig.id}#setlist" class="text-accent hover:underline">Setlist anlegen</a>
    </p>
  {:else}
    <article
      class="sheet flex aspect-[210/297] w-full flex-col overflow-hidden rounded-sm bg-surface text-text shadow-lg print:aspect-auto print:h-[297mm] print:rounded-none print:shadow-none"
      style:--count={data.setlist.length}
    >
      <header
        class="flex items-end justify-between gap-[4cqw] bg-linear-to-br from-accent to-brand-deep px-[6cqw] py-[4.5cqw] text-accent-contrast"
      >
        <div class="text-[9cqw] leading-[0.85] font-black tracking-tighter lowercase">
          twiceasmad
        </div>
        <div class="min-w-0 text-right text-[2.4cqw] leading-tight">
          <div class="truncate text-[3.2cqw] font-bold">{gig.venue?.name ?? gig.title}</div>
          {#if gig.venue?.city}<div class="truncate opacity-85">{gig.venue.city}</div>{/if}
          <div class="whitespace-nowrap opacity-85">{date}</div>
        </div>
      </header>

      <ol class="songs flex flex-1 flex-col justify-center px-[6cqw] py-[3cqw]">
        {#each data.setlist as entry, index (index)}
          <li class="flex items-baseline gap-[0.5em] leading-[1.25]">
            <span
              class="w-[1.6em] shrink-0 text-right text-[0.55em] font-semibold text-accent tabular-nums"
            >
              {index + 1}
            </span>
            <span class="truncate font-extrabold tracking-tight uppercase">{entry.title}</span>
          </li>
        {/each}
      </ol>

      <footer
        class="flex justify-between gap-4 border-t-[0.4cqw] border-accent px-[6cqw] pt-[2.5cqw] pb-[4.5cqw] text-[2.2cqw] text-muted"
      >
        <span>{gig.title}</span>
        <span class="tabular-nums">
          {#if show}Show {show.start}{show.end ? `–${show.end}` : ""} ·{/if}
          {data.setlist.length} Songs · {formatSongDuration(total)}{slot === null
            ? ""
            : ` / ${formatSongDuration(slot)}`}
        </span>
      </footer>
    </article>
  {/if}
</div>

<style>
  .sheet {
    color-scheme: light;
    container-type: size;
    print-color-adjust: exact;
  }

  .songs {
    font-size: min(7.5cqh, calc(66cqh / (var(--count) * 1.25)));
  }
</style>

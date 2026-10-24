<script lang="ts">
  import { page } from "$app/state";
  import { allowed } from "$lib/access.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import StatusChip from "$lib/components/StatusChip.svelte";
  import { formatMonth, relativeDay, todayIso } from "$lib/format";
  import { type GigStatus, gigStatuses, gigTypes } from "$lib/labels";
  import type { GigSummary } from "$lib/server/services/gigs";
  import { ChevronRight, Clock, MapPin, Plus, Printer } from "@lucide/svelte";

  let { data } = $props();

  const today = todayIso();
  const filter = $derived(page.url.searchParams.get("status") as GigStatus | null);
  const showPast = $derived(page.url.searchParams.has("past"));

  const visible = $derived(data.gigs.filter((gig) => !filter || gig.status === filter));
  const upcoming = $derived(visible.filter((gig) => gig.date >= today));
  const past = $derived(visible.filter((gig) => gig.date < today).toReversed());
  const next = $derived(upcoming.find((gig) => gig.status !== "abgesagt"));

  function byMonth(gigs: GigSummary[]) {
    const groups = new Map<string, GigSummary[]>();
    for (const gig of gigs) {
      const key = gig.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), gig]);
    }
    return [...groups.entries()];
  }

  function filterHref(status: GigStatus | null) {
    const params = new URLSearchParams(page.url.searchParams);
    if (status) params.set("status", status);
    else params.delete("status");
    const query = params.toString();
    return query ? `?${query}` : "/";
  }

  const day = (date: string) => date.slice(8, 10);
  const weekday = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("de-DE", {
      weekday: "short",
      timeZone: "UTC",
    });
</script>

<svelte:head>
  <title>Gigs · GigOrga</title>
</svelte:head>

{#snippet gigRow(gig: GigSummary)}
  <div
    class={[
      "group relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5",
      gig.status === "abgesagt" && "opacity-60",
    ]}
  >
    <div
      class="flex w-12 shrink-0 flex-col items-center rounded-lg bg-accent-soft py-1.5 text-accent"
    >
      <span class="text-[0.65rem] font-semibold tracking-wide uppercase">{weekday(gig.date)}</span>
      <span class="text-lg leading-none font-bold">{day(gig.date)}</span>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <a href="/gigs/{gig.id}" class="truncate font-medium after:absolute after:inset-0"
          >{gig.title}</a
        >
        <StatusChip status={gig.status} />
      </div>
      <div class="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted">
        {#if gig.venue}
          <span class="flex items-center gap-1">
            <MapPin class="size-3.5" />
            {gig.venue.name}{gig.venue.city ? `, ${gig.venue.city}` : ""}
          </span>
        {/if}
        {#if gig.getIn}
          <span class="flex items-center gap-1"><Clock class="size-3.5" /> Get-in {gig.getIn}</span>
        {/if}
        <span class="hidden sm:inline">{gigTypes[gig.type]}</span>
      </div>
    </div>
    <a
      href="/gigs/{gig.id}/tagesplan"
      class="relative btn-icon hover:bg-surface"
      aria-label="Tagesplan"
      title="Tagesplan"
    >
      <Printer class="size-4" />
    </a>
    <ChevronRight
      class="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
    />
  </div>
{/snippet}

<div class="flex flex-col gap-8">
  {#if next}
    <div
      class="relative overflow-hidden rounded-2xl bg-linear-to-br from-accent to-brand-deep p-6 text-white shadow-sm sm:p-8"
    >
      <div class="text-xs font-semibold tracking-widest text-white/70 uppercase">
        Nächster Gig · {relativeDay(next.date, today)}
      </div>
      <a
        href="/gigs/{next.id}"
        class="mt-2 block text-2xl font-bold tracking-tight after:absolute after:inset-0 sm:text-3xl"
        >{next.title}</a
      >
      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/85">
        <span>
          {new Date(`${next.date}T00:00:00Z`).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          })}
        </span>
        {#if next.venue}<span>{next.venue.name}{next.venue.city ? `, ${next.venue.city}` : ""}</span
          >{/if}
        {#if next.getIn}<span>Get-in {next.getIn}</span>{/if}
        {#if next.showTime}<span>Show {next.showTime}</span>{/if}
      </div>
      <a
        href="/gigs/{next.id}/tagesplan"
        class="relative mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-sm font-medium transition-colors hover:bg-white/25"
      >
        <Printer class="size-3.5" /> Tagesplan
      </a>
    </div>
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <a href={filterHref(null)} class={["chip", !filter ? "bg-accent text-accent-contrast" : ""]}
      >Alle</a
    >
    {#each Object.entries(gigStatuses) as [key, label] (key)}
      <a
        href={filterHref(key as GigStatus)}
        class={["chip", filter === key ? "bg-accent text-accent-contrast" : "bg-surface-2"]}
      >
        {label}
      </a>
    {/each}
  </div>

  {#if data.gigs.length === 0}
    <div class="card">
      <EmptyState
        title="Noch keine Gigs"
        description="Leg den ersten Gig an – Venue, Zeiten und Deal kannst du danach ergänzen."
      >
        {#if allowed("edit")}
          <a href="/gigs/new" class="btn btn-primary"><Plus class="size-4" /> Neuer Gig</a>
        {/if}
      </EmptyState>
    </div>
  {:else if upcoming.length === 0}
    <p class="text-sm text-muted">Keine kommenden Gigs{filter ? " mit diesem Status" : ""}.</p>
  {/if}

  {#each byMonth(upcoming) as [month, gigs] (month)}
    <section>
      <h2 class="mb-2 px-1 text-sm font-semibold text-muted">{formatMonth(`${month}-01`)}</h2>
      <div class="divide-y divide-border overflow-hidden card">
        {#each gigs as gig (gig.id)}
          {@render gigRow(gig)}
        {/each}
      </div>
    </section>
  {/each}

  {#if past.length > 0}
    <section>
      {#if showPast}
        <h2 class="mb-2 px-1 text-sm font-semibold text-muted">Vergangene Gigs</h2>
        <div class="divide-y divide-border overflow-hidden card">
          {#each past as gig (gig.id)}
            {@render gigRow(gig)}
          {/each}
        </div>
      {:else}
        <a
          href="?{new URLSearchParams([...page.url.searchParams, ['past', '1']])}"
          class="btn btn-ghost"
        >
          {past.length} vergangene Gigs anzeigen
        </a>
      {/if}
    </section>
  {/if}
</div>

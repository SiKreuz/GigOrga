<script lang="ts">
  import Fact from "$lib/components/Fact.svelte";
  import { hasAccommodation, hasContacts, hasHospitality, playtime, timesOf } from "$lib/daysheet";
  import { formatDuration, formatMoney } from "$lib/format";
  import { accommodationTypes, timetableKinds } from "$lib/labels";
  import { ArrowLeft, AudioLines, Lock, Mail, MapPin, Phone, Printer } from "@lucide/svelte";

  let { data } = $props();

  const gig = $derived(data.gig);
  const venue = $derived(gig.venue);
  const times = $derived(timesOf(gig));
  const venueAddress = $derived(
    venue ? [venue.address, venue.city].filter(Boolean).join(", ") : "",
  );
  const mapsUrl = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const startOf = (kind: string) => times.find((entry) => entry.kind === kind)?.start;
  const highlights = $derived(
    [
      { label: "Get-in", value: startOf("getin") },
      { label: "Show", value: startOf("show") },
      {
        label: "Spielzeit",
        value: playtime(gig) === null ? undefined : formatDuration(playtime(gig)),
      },
    ].filter((item) => item.value),
  );
  const accommodationExtras = $derived(
    [gig.breakfast ? "mit Frühstück" : "", gig.accommodationPaid ? "zahlt Veranstalter" : ""]
      .filter(Boolean)
      .join(" · "),
  );
</script>

<svelte:head>
  <title>twiceasmad · Tagesplan · {gig.title}</title>
</svelte:head>

{#snippet heading(title: string)}
  <h2
    class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase after:flex-1 after:border-t after:border-border"
  >
    {title}
  </h2>
{/snippet}

<div
  class="mx-auto flex max-w-2xl flex-col gap-6 print:max-w-none print:gap-5 print:box-decoration-clone print:px-[16mm] print:py-[14mm]"
>
  <div class="flex items-center justify-between gap-3 print:hidden">
    <a
      href="/gigs/{gig.id}"
      class="inline-flex items-center gap-1 text-sm text-muted hover:text-text"
    >
      <ArrowLeft class="size-4" /> Zum Gig
    </a>
    <button class="btn h-9 btn-ghost px-3" onclick={() => window.print()}>
      <Printer class="size-3.5" /> Drucken
    </button>
  </div>

  <header
    class="flex flex-col gap-4 border-b-2 border-accent pb-4 sm:flex-row sm:items-end sm:justify-between print:flex-row print:items-end print:justify-between"
  >
    <div class="min-w-0">
      <div
        class="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-accent uppercase"
      >
        <AudioLines class="size-3.5" /> twiceasmad
        <span class="font-medium text-muted">· Tagesplan</span>
      </div>
      <h1 class="mt-1.5 text-2xl font-bold tracking-tight">{gig.title}</h1>
      <p class="mt-0.5 text-sm text-muted">
        {new Date(`${gig.date}T00:00:00Z`).toLocaleDateString("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })}
        {#if venue}· {venue.name}{venue.city ? `, ${venue.city}` : ""}{/if}
      </p>
    </div>
    {#if highlights.length > 0}
      <dl class="flex shrink-0 gap-6">
        {#each highlights as item (item.label)}
          <div>
            <dt class="text-[0.65rem] font-semibold tracking-widest text-muted uppercase">
              {item.label}
            </dt>
            <dd class="text-lg leading-tight font-bold tabular-nums">{item.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}
  </header>

  {#if times.length > 0 || hasContacts(gig)}
    <div class="grid gap-6 sm:grid-cols-2 print:grid-cols-2 print:gap-8">
      {#if times.length > 0}
        <section class="break-inside-avoid">
          {@render heading("Zeitplan")}
          <ol class="flex flex-col gap-1">
            {#each times as entry (entry.id)}
              <li class={["flex items-baseline gap-3 text-sm", entry.fixed && "font-semibold"]}>
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
        </section>
      {/if}

      {#if hasContacts(gig)}
        <section class="break-inside-avoid">
          {@render heading("Venue & Kontakte")}
          <div class="flex flex-col gap-3 text-sm">
            {#if venue}
              <div>
                <div class="font-medium">{venue.name}</div>
                {#if venueAddress}
                  <a
                    href={mapsUrl([venue.name, venueAddress].join(", "))}
                    target="_blank"
                    rel="noreferrer"
                    class="flex items-center gap-1 text-muted hover:text-accent"
                  >
                    <MapPin class="size-3.5" />{venueAddress}
                  </a>
                {/if}
                {#if venue.loadIn}
                  <p class="mt-1 whitespace-pre-line">
                    <span class="text-muted">Ladezone / Parken:</span>
                    {venue.loadIn}
                  </p>
                {/if}
              </div>
            {/if}
            {#each gig.contacts as link (link.contactId)}
              <div>
                <span class="font-medium">{link.contact.name}</span>
                {#if link.role}<span class="text-muted"> · {link.role}</span>{/if}
                <div class="flex flex-wrap gap-x-4 text-muted">
                  {#if link.contact.phone}
                    <a
                      href="tel:{link.contact.phone}"
                      class="flex items-center gap-1 hover:text-accent"
                      ><Phone class="size-3.5" />{link.contact.phone}</a
                    >
                  {/if}
                  {#if link.contact.email}
                    <a
                      href="mailto:{link.contact.email}"
                      class="flex items-center gap-1 hover:text-accent"
                      ><Mail class="size-3.5" />{link.contact.email}</a
                    >
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  {/if}

  {#if hasHospitality(gig) || hasAccommodation(gig)}
    <div class="grid gap-6 sm:grid-cols-2 print:grid-cols-2 print:gap-8">
      {#if hasHospitality(gig)}
        <section class="break-inside-avoid">
          {@render heading("Essen & Getränke")}
          <dl class="flex flex-col gap-2">
            <Fact label="Essen">{gig.catering ? "Catering vor Ort" : "kein Catering"}</Fact>
            {#if gig.buyout !== null}<Fact label="Essensgeld (Buyout)"
                >{formatMoney(gig.buyout)}</Fact
              >{/if}
            {#if gig.drinks}<Fact label="Getränke">{gig.drinks}</Fact>{/if}
            {#if gig.hospitalityNotes}<Fact label="Notizen">{gig.hospitalityNotes}</Fact>{/if}
          </dl>
        </section>
      {/if}
      {#if hasAccommodation(gig)}
        <section class="break-inside-avoid">
          {@render heading("Übernachtung")}
          <dl class="flex flex-col gap-2">
            <Fact label="Art"
              >{accommodationTypes[gig.accommodationType]}{gig.accommodationName
                ? ` · ${gig.accommodationName}`
                : ""}</Fact
            >
            {#if gig.accommodationAddress}
              <Fact label="Adresse">
                <a
                  href={mapsUrl(gig.accommodationAddress)}
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-1 hover:text-accent"
                >
                  <MapPin class="size-3.5" />{gig.accommodationAddress}
                </a>
              </Fact>
            {/if}
            {#if gig.checkIn}<Fact label="Check-in ab">{gig.checkIn}</Fact>{/if}
            {#if gig.beds !== null}<Fact label="Schlafplätze">{gig.beds}</Fact>{/if}
            {#if accommodationExtras}<Fact label="Extras">{accommodationExtras}</Fact>{/if}
            {#if gig.accommodationNotes}<Fact label="Notizen">{gig.accommodationNotes}</Fact>{/if}
          </dl>
        </section>
      {/if}
    </div>
  {/if}
</div>

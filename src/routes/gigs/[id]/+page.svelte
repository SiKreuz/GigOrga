<script lang="ts">
  import { allowed } from "$lib/access.svelte";
  import AccommodationSection from "$lib/components/gig/AccommodationSection.svelte";
  import BasicsForm from "$lib/components/gig/BasicsForm.svelte";
  import DealSection from "$lib/components/gig/DealSection.svelte";
  import HospitalitySection from "$lib/components/gig/HospitalitySection.svelte";
  import LineupSection from "$lib/components/gig/LineupSection.svelte";
  import TechSection from "$lib/components/gig/TechSection.svelte";
  import TimetableSection from "$lib/components/gig/TimetableSection.svelte";
  import TravelSection from "$lib/components/gig/TravelSection.svelte";
  import VenueContactsSection from "$lib/components/gig/VenueContactsSection.svelte";
  import StatusChip from "$lib/components/StatusChip.svelte";
  import { hasAccommodation, hasContacts, hasHospitality } from "$lib/daysheet";
  import { estimate, travelCost, tripOf } from "$lib/deal";
  import { formatMoney, formatNumber, relativeDay, todayIso } from "$lib/format";
  import { gigTypes, timetableKinds } from "$lib/labels";
  import { ArrowLeft, Lock, MapPin, Pencil, Plus, Printer, Route } from "@lucide/svelte";

  let { data, form } = $props();

  const gig = $derived(data.gig);
  const people = $derived(gig.people ?? data.settings.bandSize);
  const prices = $derived({
    benzin: gig.petrolPrice ?? data.settings.petrolPrice,
    diesel: gig.dieselPrice ?? data.settings.dieselPrice,
  });
  const travel = $derived(travelCost(tripOf(gig, gig.tourLeg), gig.cars, prices));
  const net = $derived(estimate(gig, travel, people).net);

  let editingBasics = $state(false);
  let editing = $state({
    zeitplan: false,
    venue: false,
    deal: false,
    fahrt: false,
    technik: false,
    lineup: false,
    hospitality: false,
    uebernachtung: false,
  });

  type SectionId = keyof typeof editing;

  const optional: { id: SectionId; label: string; empty: boolean }[] = $derived([
    { id: "venue", label: "Kontakte", empty: !hasContacts(gig) },
    { id: "lineup", label: "Line-up", empty: gig.supportActs.length === 0 },
    { id: "hospitality", label: "Essen & Getränke", empty: !hasHospitality(gig) },
    { id: "uebernachtung", label: "Übernachtung", empty: !hasAccommodation(gig) },
  ]);
  const shown = (id: SectionId) =>
    editing[id] === true || optional.find((section) => section.id === id)?.empty === false;
  const addable = $derived(
    optional.filter((section) => section.empty && editing[section.id] !== true),
  );

  function errorsFor(section: string): Record<string, string> {
    if (form && "section" in form && form.section === section && "errors" in form) {
      return form.errors ?? {};
    }
    return {};
  }

  const routeError = $derived(form && "routeError" in form ? form.routeError : undefined);
  const keyTimes = $derived(
    gig.timetable.filter((entry) => entry.start && ["getin", "show"].includes(entry.kind)),
  );
  const open = $derived(
    [
      gig.backline.some((item) => item.provider === "unklar") && "Backline klären",
      !gig.riderSent && "Tech Rider schicken",
      !gig.venue && "Venue fehlt",
      gig.date < todayIso() &&
        gig.invoiceStatus === "offen" &&
        gig.dealType !== "unbezahlt" &&
        "Rechnung stellen",
    ].filter((item) => typeof item === "string"),
  );
</script>

<svelte:head>
  <title>{gig.title} · GigOrga</title>
</svelte:head>

{#key gig.id}
  <div class="mx-auto flex max-w-4xl flex-col gap-5">
    <div>
      <a href="/" class="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft class="size-4" /> Alle Gigs
      </a>
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{gig.title}</h1>
            <StatusChip status={gig.status} />
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>
              {new Date(`${gig.date}T00:00:00Z`).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
              · {relativeDay(gig.date, todayIso())}
            </span>
            {#if gig.venue}
              <span class="flex items-center gap-1">
                <MapPin class="size-3.5" />{gig.venue.name}{gig.venue.city
                  ? `, ${gig.venue.city}`
                  : ""}
              </span>
            {/if}
            <span>{gigTypes[gig.type]}</span>
            {#if gig.tourLeg}
              <a
                href="/tours/{gig.tourLeg.tour.id}"
                class="flex items-center gap-1 text-accent hover:underline"
              >
                <Route class="size-3.5" />{gig.tourLeg.tour.name}
              </a>
            {/if}
          </div>
        </div>
        <a href="/gigs/{gig.id}/tagesplan" class="btn h-9 btn-ghost px-3">
          <Printer class="size-3.5" /> Tagesplan
        </a>
        {#if !editingBasics && allowed("edit")}
          <button class="btn h-9 btn-ghost px-3" onclick={() => (editingBasics = true)}>
            <Pencil class="size-3.5" /> Bearbeiten
          </button>
        {/if}
      </div>
      <div class="mt-4 flex flex-wrap gap-2 text-sm">
        {#each keyTimes as entry (entry.id)}
          <span
            class={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5",
              entry.fixed ? "bg-accent text-accent-contrast" : "bg-surface-2",
            ]}
          >
            {timetableKinds[entry.kind]} <strong class="tabular-nums">{entry.start}</strong>
            {#if entry.fixed}<Lock class="size-3" />{/if}
          </span>
        {/each}
        {#if net !== null}
          <span class="rounded-lg bg-surface-2 px-3 py-1.5"
            >Netto <strong>{formatMoney(net)}</strong></span
          >
        {/if}
        {#if gig.distanceKm !== null}
          <span class="rounded-lg bg-surface-2 px-3 py-1.5">{formatNumber(gig.distanceKm)} km</span>
        {/if}
        {#each open as item (item)}
          <span class="rounded-lg bg-warning-soft px-3 py-1.5 text-warning">{item}</span>
        {/each}
      </div>
    </div>

    {#if editingBasics}
      <BasicsForm
        {gig}
        venues={data.venues}
        tours={data.tours}
        errors={errorsFor("basics")}
        onclose={() => (editingBasics = false)}
      />
    {/if}

    <TimetableSection {gig} errors={errorsFor("timetable")} bind:editing={editing.zeitplan} />
    {#if shown("venue")}
      <VenueContactsSection
        {gig}
        contacts={data.contacts}
        errors={errorsFor("contacts")}
        bind:editing={editing.venue}
      />
    {/if}
    <DealSection {gig} {travel} {people} errors={errorsFor("deal")} bind:editing={editing.deal} />
    <TravelSection
      {gig}
      cars={data.cars}
      settings={data.settings}
      {travel}
      {people}
      {prices}
      errors={errorsFor("travel")}
      {routeError}
      bind:editing={editing.fahrt}
    />
    <TechSection
      {gig}
      soundEngineers={data.soundEngineers}
      errors={errorsFor("tech")}
      bind:editing={editing.technik}
    />
    {#if shown("lineup")}
      <LineupSection {gig} errors={errorsFor("lineup")} bind:editing={editing.lineup} />
    {/if}
    {#if shown("hospitality")}
      <HospitalitySection
        {gig}
        errors={errorsFor("hospitality")}
        bind:editing={editing.hospitality}
      />
    {/if}
    {#if shown("uebernachtung")}
      <AccommodationSection
        {gig}
        errors={errorsFor("accommodation")}
        bind:editing={editing.uebernachtung}
      />
    {/if}

    {#if addable.length > 0 && allowed("edit")}
      <div
        class="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-4"
      >
        <span class="mr-1 text-sm text-muted">Hinzufügen:</span>
        {#each addable as section (section.id)}
          <button class="btn h-8 btn-ghost px-3" onclick={() => (editing[section.id] = true)}>
            <Plus class="size-3.5" />
            {section.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/key}

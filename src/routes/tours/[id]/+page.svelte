<script lang="ts">
  import { enhance } from "$app/forms";
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import Field from "$lib/components/Field.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import StatusChip from "$lib/components/StatusChip.svelte";
  import { travelCost, tripOf } from "$lib/deal";
  import { formatDate, formatMoney, formatNumber } from "$lib/format";
  import { ArrowLeft, House, LoaderCircle, Pencil, Route } from "@lucide/svelte";

  let { data, form } = $props();

  let editing = $state(false);
  let routing = $state(false);

  const tour = $derived(data.tour);
  const previousName = (stop: (typeof tour.stops)[number] | undefined) =>
    stop ? (stop.venue?.name ?? stop.title) : "zu Hause";
  const legs = $derived(
    tour.stops.map((stop, index) => {
      const returnsHome = index === tour.stops.length - 1;
      const prices = {
        benzin: stop.petrolPrice ?? data.settings.petrolPrice,
        diesel: stop.dieselPrice ?? data.settings.dieselPrice,
      };
      return {
        stop,
        from: previousName(tour.stops[index - 1]),
        returnsHome,
        cost: travelCost(tripOf(stop, { returnsHome }), stop.cars, prices),
      };
    }),
  );
  const totalKm = $derived(
    legs.reduce(
      (sum, leg) =>
        sum + (leg.stop.distanceKm ?? 0) + (leg.returnsHome ? (leg.stop.returnKm ?? 0) : 0),
      0,
    ),
  );
  const complete = $derived(legs.every((leg) => leg.cost !== null));
  const totalCost = $derived(legs.reduce((sum, leg) => sum + (leg.cost ?? 0), 0));
  const routeError = $derived(form && "routeError" in form ? form.routeError : undefined);
  const nameError = $derived(form && "errors" in form ? form.errors?.name : undefined);
</script>

<svelte:head>
  <title>{tour.name} · GigOrga</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <div>
    <a href="/tours" class="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      ><ArrowLeft class="size-4" /> Alle Touren</a
    >
    {#if editing}
      <div class="card p-5 sm:p-6">
        <SectionForm
          action="?/update"
          onsaved={() => (editing = false)}
          oncancel={() => (editing = false)}
        >
          <Field id="name" label="Name der Tour" error={nameError}>
            <input id="name" name="name" class="input" value={tour.name} required />
          </Field>
          {#snippet extra()}
            <div class="mr-auto">
              <ConfirmButton
                message="Tour löschen? Die Gigs bleiben erhalten."
                label="Tour löschen"
                formaction="?/delete"
              />
            </div>
          {/snippet}
        </SectionForm>
      </div>
    {:else}
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="flex-1 text-2xl font-semibold tracking-tight">{tour.name}</h1>
        <button class="btn h-9 btn-ghost px-3" onclick={() => (editing = true)}>
          <Pencil class="size-3.5" /> Bearbeiten
        </button>
      </div>
    {/if}
  </div>

  {#if tour.stops.length > 0}
    <div class="flex flex-wrap items-center gap-3 rounded-xl bg-accent-soft p-4">
      <div class="flex-1">
        <div class="text-lg font-semibold">
          {complete ? formatMoney(totalCost) : "Fahrtkosten unvollständig"}
        </div>
        <div class="text-xs text-muted">{formatNumber(totalKm)} km Rundreise inkl. Heimfahrt</div>
      </div>
      <form
        method="POST"
        action="?/route"
        use:enhance={() => {
          routing = true;
          return async ({ update }) => {
            await update();
            routing = false;
          };
        }}
      >
        <button class="btn h-9 btn-ghost px-3" disabled={routing}>
          {#if routing}<LoaderCircle class="size-4 animate-spin" />{:else}<Route
              class="size-4"
            />{/if}
          Alle Routen berechnen
        </button>
      </form>
    </div>
    {#if routeError}<p class="text-sm text-danger">{routeError}</p>{/if}

    <ol class="divide-y divide-border overflow-hidden card">
      {#each legs as leg (leg.stop.id)}
        <li class="flex flex-col gap-1 px-5 py-3.5">
          <div class="flex flex-wrap items-center gap-3">
            <span class="w-24 text-sm text-muted tabular-nums">{formatDate(leg.stop.date)}</span>
            <a
              href="/gigs/{leg.stop.id}"
              class="min-w-0 flex-1 truncate font-medium hover:underline">{leg.stop.title}</a
            >
            <StatusChip status={leg.stop.status} />
          </div>
          <div class="flex flex-wrap gap-x-4 text-sm text-muted sm:pl-27">
            <span>
              von {leg.from}{leg.stop.distanceKm === null
                ? " · Strecke fehlt"
                : ` · ${formatNumber(leg.stop.distanceKm)} km`}
            </span>
            {#if leg.returnsHome}
              <span class="flex items-center gap-1">
                <House class="size-3.5" />
                {leg.stop.returnKm === null
                  ? "Heimfahrt fehlt"
                  : `${formatNumber(leg.stop.returnKm)} km heim`}
              </span>
            {/if}
            <span class="ml-auto font-medium text-text">{formatMoney(leg.cost)}</span>
          </div>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="text-sm text-muted">
      Noch keine Gigs auf dieser Tour. Ordne Gigs über „Bearbeiten“ auf der Gig-Seite der Tour zu.
    </p>
  {/if}
</div>

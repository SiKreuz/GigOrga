<script lang="ts">
  import { resolve } from "$app/paths";
  import Field from "$lib/components/Field.svelte";
  import { travelCost, tripOf } from "$lib/deal";
  import { formatMoney, formatNumber, parseNumber } from "$lib/format";
  import { fuelTypes } from "$lib/labels";
  import type { CarSummary } from "$lib/server/services/cars";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { Check, Minus, Plus } from "@lucide/svelte";
  import { untrack } from "svelte";

  let {
    gig,
    cars,
    settings,
    errors,
  }: {
    gig: GigDetail;
    cars: CarSummary[];
    settings: { bandSize: number; petrolPrice: number; dieselPrice: number };
    errors: Record<string, string>;
  } = $props();

  const trip = $state(
    untrack(() => ({
      distanceKm: formatNumber(gig.distanceKm),
      returnKm: formatNumber(gig.returnKm),
      tolls: formatNumber(gig.tolls),
      petrolPrice: formatNumber(gig.petrolPrice),
      dieselPrice: formatNumber(gig.dieselPrice),
      people: gig.people ?? settings.bandSize,
      carIds: gig.cars.map((car) => car.id),
    })),
  );

  const selected = $derived(cars.filter((car) => trip.carIds.includes(car.id)));
  const seats = $derived(selected.reduce((sum, car) => sum + (car.seats ?? 0), 0));
  const leg = $derived(gig.tourLeg);
  const cost = $derived(
    travelCost(
      tripOf(
        {
          distanceKm: parseNumber(trip.distanceKm),
          returnKm: parseNumber(trip.returnKm),
          tolls: parseNumber(trip.tolls),
        },
        leg,
      ),
      selected,
      {
        benzin: parseNumber(trip.petrolPrice) ?? settings.petrolPrice,
        diesel: parseNumber(trip.dieselPrice) ?? settings.dieselPrice,
      },
    ),
  );

  function toggle(id: string) {
    trip.carIds = trip.carIds.includes(id)
      ? trip.carIds.filter((carId) => carId !== id)
      : [...trip.carIds, id];
  }
</script>

<input type="hidden" name="carIds" value={JSON.stringify(trip.carIds)} />
<input type="hidden" name="people" value={trip.people} />

<div class="grid gap-5 sm:grid-cols-[auto_1fr]">
  <div class="flex flex-col gap-1.5">
    <span class="label">Personen</span>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="btn w-10 btn-ghost px-0"
        onclick={() => (trip.people = Math.max(1, trip.people - 1))}
        aria-label="Weniger"
      >
        <Minus class="size-4" />
      </button>
      <span class="w-8 text-center text-lg font-semibold tabular-nums">{trip.people}</span>
      <button
        type="button"
        class="btn w-10 btn-ghost px-0"
        onclick={() => (trip.people += 1)}
        aria-label="Mehr"
      >
        <Plus class="size-4" />
      </button>
    </div>
    <span class="text-xs text-muted">Band: {settings.bandSize}</span>
  </div>

  <div class="flex flex-col gap-1.5">
    <span class="label">Autos</span>
    {#if cars.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each cars as car (car.id)}
          {@const active = trip.carIds.includes(car.id)}
          <button
            type="button"
            class={[
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              active ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2",
            ]}
            onclick={() => toggle(car.id)}
            aria-pressed={active}
          >
            <span
              class={[
                "flex size-4 items-center justify-center rounded border",
                active ? "border-accent bg-accent text-accent-contrast" : "border-border",
              ]}
            >
              {#if active}<Check class="size-3" />{/if}
            </span>
            <span>
              <span class="font-medium">{car.name}</span>
              <span class="block text-xs text-muted">
                {fuelTypes[car.fuel]} · {formatNumber(car.consumption)} l/100 km{car.seats
                  ? ` · ${car.seats} Plätze`
                  : ""}
              </span>
            </span>
          </button>
        {/each}
      </div>
      {#if seats > 0 && seats < trip.people}
        <span class="text-xs text-warning">Nur {seats} Sitzplätze für {trip.people} Personen.</span>
      {/if}
    {:else}
      <p class="text-sm text-muted">
        Noch keine Autos angelegt – <a
          href={resolve("/settings")}
          class="text-accent hover:underline">in den Einstellungen hinzufügen</a
        >.
      </p>
    {/if}
  </div>
</div>

<div class="grid gap-4 sm:grid-cols-3">
  <Field
    id="distanceKm"
    label={leg ? "Anfahrt (km)" : "Strecke (km, einfach)"}
    error={errors.distanceKm}
    hint={leg ? `von ${leg.from?.title ?? "zu Hause"}` : undefined}
  >
    <input
      id="distanceKm"
      name="distanceKm"
      class="input"
      inputmode="decimal"
      bind:value={trip.distanceKm}
    />
  </Field>
  <Field id="durationMin" label="Fahrzeit (min)" error={errors.durationMin}>
    <input
      id="durationMin"
      name="durationMin"
      class="input"
      inputmode="numeric"
      value={formatNumber(gig.durationMin)}
    />
  </Field>
  {#if leg?.returnsHome}
    <Field id="returnKm" label="Heimfahrt (km)" error={errors.returnKm}>
      <input
        id="returnKm"
        name="returnKm"
        class="input"
        inputmode="decimal"
        bind:value={trip.returnKm}
      />
    </Field>
    <Field id="returnMin" label="Heimfahrt (min)" error={errors.returnMin}>
      <input
        id="returnMin"
        name="returnMin"
        class="input"
        inputmode="numeric"
        value={formatNumber(gig.returnMin)}
      />
    </Field>
  {/if}
  <Field id="tolls" label="Maut / Parken (€)" error={errors.tolls}>
    <input id="tolls" name="tolls" class="input" inputmode="decimal" bind:value={trip.tolls} />
  </Field>
  <Field id="dieselPrice" label="Diesel (€/l)" error={errors.dieselPrice} hint="Leer = Standard">
    <input
      id="dieselPrice"
      name="dieselPrice"
      class="input"
      inputmode="decimal"
      bind:value={trip.dieselPrice}
      placeholder={formatNumber(settings.dieselPrice)}
    />
  </Field>
  <Field id="petrolPrice" label="Benzin (€/l)" error={errors.petrolPrice} hint="Leer = Standard">
    <input
      id="petrolPrice"
      name="petrolPrice"
      class="input"
      inputmode="decimal"
      bind:value={trip.petrolPrice}
      placeholder={formatNumber(settings.petrolPrice)}
    />
  </Field>
</div>

<div class="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-accent-soft p-4">
  <span class="text-xs text-muted">
    {#if !leg}
      Hin & zurück, je Auto mit eigenem Verbrauch
    {:else if leg.returnsHome}
      Anfahrt und Heimfahrt, je Auto mit eigenem Verbrauch
    {:else}
      Nur Anfahrt – danach geht es zum nächsten Tour-Gig
    {/if}
  </span>
  <span class="text-lg font-semibold">{formatMoney(cost)}</span>
</div>

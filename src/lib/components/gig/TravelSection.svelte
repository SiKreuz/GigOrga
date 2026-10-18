<script lang="ts">
  import { enhance } from "$app/forms";
  import Fact from "$lib/components/Fact.svelte";
  import Section from "$lib/components/Section.svelte";
  import type { FuelPrices } from "$lib/deal";
  import { formatDuration, formatMoney, formatNumber } from "$lib/format";
  import { fuelTypes } from "$lib/labels";
  import type { CarSummary } from "$lib/server/services/cars";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { Car, ExternalLink, LoaderCircle, Route } from "@lucide/svelte";

  import TravelForm from "./TravelForm.svelte";

  let {
    gig,
    cars,
    settings,
    travel,
    people,
    prices,
    errors,
    routeError,
    editing = $bindable(false),
  }: {
    gig: GigDetail;
    cars: CarSummary[];
    settings: { homeAddress: string; bandSize: number; petrolPrice: number; dieselPrice: number };
    travel: number | null;
    people: number;
    prices: FuelPrices;
    errors: Record<string, string>;
    routeError?: string;
    editing?: boolean;
  } = $props();

  let routing = $state(false);

  const destination = $derived(
    gig.venue ? [gig.venue.name, gig.venue.address, gig.venue.city].filter(Boolean).join(", ") : "",
  );
  const leg = $derived(gig.tourLeg);
  const origin = $derived(
    leg?.from
      ? [leg.from.venue?.name, leg.from.venue?.city].filter(Boolean).join(", ")
      : settings.homeAddress,
  );
  const mapsUrl = $derived(
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
  );
  const seats = $derived(gig.cars.reduce((sum, car) => sum + (car.seats ?? 0), 0));
  const fuels = $derived(
    gig.cars.length > 0
      ? [...new Set(gig.cars.map((car) => car.fuel))]
      : (Object.keys(fuelTypes) as (keyof typeof fuelTypes)[]),
  );
  const customPrice = $derived(gig.petrolPrice !== null || gig.dieselPrice !== null);
</script>

<Section id="fahrt" title="Fahrt" icon={Car} action="?/travel" bind:editing>
  {#snippet summary()}
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="min-w-0 flex-1">
          {#if gig.distanceKm !== null}
            <div class="text-lg font-semibold">
              {formatNumber(gig.distanceKm)} km · {formatDuration(gig.durationMin)}
            </div>
            <div class="text-xs text-muted">
              {leg ? `Anfahrt von ${leg.from?.title ?? "zu Hause"}` : "einfache Strecke"}
            </div>
            {#if leg?.returnsHome}
              <div class="mt-1 text-sm">
                {#if gig.returnKm === null}
                  <span class="text-warning">Heimfahrt fehlt – Route berechnen</span>
                {:else}
                  + {formatNumber(gig.returnKm)} km · {formatDuration(gig.returnMin)} Heimfahrt
                {/if}
              </div>
            {/if}
          {:else}
            <div class="text-sm text-muted">Noch keine Strecke.</div>
          {/if}
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
          <button class="btn h-9 btn-ghost px-3" disabled={!gig.venue || routing}>
            {#if routing}<LoaderCircle class="size-4 animate-spin" />{:else}<Route
                class="size-4"
              />{/if}
            Route berechnen
          </button>
        </form>
        {#if gig.venue && origin}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            class="btn-icon"
            aria-label="In Google Maps öffnen"
            title="In Google Maps öffnen"
          >
            <ExternalLink class="size-4" />
          </a>
        {/if}
      </div>
      {#if routeError}<p class="text-sm text-danger">{routeError}</p>{/if}
      {#if !settings.homeAddress}
        <p class="text-xs text-muted">
          Für die Route fehlt die Startadresse –
          <a href="/settings" class="text-accent hover:underline">in den Einstellungen eintragen</a
          >.
        </p>
      {/if}
      <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-4">
        <Fact label="Personen">{people}</Fact>
        <Fact label="Autos">
          {gig.cars.length > 0 ? gig.cars.map((car) => car.name).join(", ") : "keine"}
          {#if seats > 0 && seats < people}
            <span class="block text-xs text-warning">nur {seats} Sitzplätze</span>
          {/if}
        </Fact>
        <Fact label="Spritpreis">
          {fuels.map((fuel) => `${fuelTypes[fuel]} ${formatNumber(prices[fuel])}`).join(" · ")} €/l{customPrice
            ? " (angepasst)"
            : ""}
        </Fact>
        <Fact label="Fahrtkosten">
          <span class="font-semibold">{formatMoney(travel)}</span>
          {#if gig.tolls}<span class="text-xs text-muted">
              inkl. {formatMoney(gig.tolls)} Maut/Parken</span
            >{/if}
        </Fact>
      </dl>
    </div>
  {/snippet}
  {#snippet form()}
    <TravelForm {gig} {cars} {settings} {errors} />
  {/snippet}
</Section>

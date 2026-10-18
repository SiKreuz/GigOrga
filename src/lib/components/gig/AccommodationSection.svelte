<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Fact from "$lib/components/Fact.svelte";
  import Field from "$lib/components/Field.svelte";
  import Section from "$lib/components/Section.svelte";
  import Select from "$lib/components/Select.svelte";
  import { formatNumber } from "$lib/format";
  import { accommodationTypes } from "$lib/labels";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { BedDouble, ExternalLink, MapPin } from "@lucide/svelte";

  let {
    gig,
    errors,
    editing = $bindable(false),
  }: { gig: GigDetail; errors: Record<string, string>; editing?: boolean } = $props();

  const mapsUrl = $derived(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gig.accommodationAddress)}`,
  );
</script>

<Section
  id="uebernachtung"
  title="Übernachtung"
  icon={BedDouble}
  action="?/accommodation"
  bind:editing
>
  {#snippet summary()}
    <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      <Fact label="Art">{accommodationTypes[gig.accommodationType]}</Fact>
      {#if gig.accommodationName}<Fact label="Bei / Name">{gig.accommodationName}</Fact>{/if}
      {#if gig.beds !== null}<Fact label="Schlafplätze">{gig.beds}</Fact>{/if}
      {#if gig.accommodationAddress}
        <Fact label="Adresse" wide>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1 hover:text-accent"
          >
            <MapPin class="size-3.5" />{gig.accommodationAddress}
          </a>
        </Fact>
      {/if}
      {#if gig.checkIn}<Fact label="Check-in ab">{gig.checkIn}</Fact>{/if}
      <Fact label="Extras">
        {[gig.breakfast ? "mit Frühstück" : "", gig.accommodationPaid ? "zahlt Veranstalter" : ""]
          .filter(Boolean)
          .join(" · ") || "–"}
      </Fact>
      {#if gig.accommodationLink}
        <Fact label="Link">
          <a
            href={gig.accommodationLink}
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Öffnen<ExternalLink class="size-3" />
          </a>
        </Fact>
      {/if}
      {#if gig.accommodationNotes}<Fact label="Notizen" wide>{gig.accommodationNotes}</Fact>{/if}
    </dl>
  {/snippet}
  {#snippet form()}
    <div class="grid gap-4 sm:grid-cols-2">
      <Field id="accommodationType" label="Art">
        <Select
          id="accommodationType"
          options={accommodationTypes}
          value={gig.accommodationType === "keine" ? "hotel" : gig.accommodationType}
        />
      </Field>
      <Field id="accommodationName" label="Bei / Name">
        <input
          id="accommodationName"
          name="accommodationName"
          class="input"
          value={gig.accommodationName}
        />
      </Field>
      <Field id="accommodationAddress" label="Adresse">
        <input
          id="accommodationAddress"
          name="accommodationAddress"
          class="input"
          value={gig.accommodationAddress}
        />
      </Field>
      <Field id="accommodationLink" label="Link / Buchung">
        <input
          id="accommodationLink"
          name="accommodationLink"
          class="input"
          value={gig.accommodationLink}
        />
      </Field>
      <Field id="beds" label="Schlafplätze" error={errors.beds}>
        <input
          id="beds"
          name="beds"
          class="input"
          inputmode="numeric"
          value={formatNumber(gig.beds)}
        />
      </Field>
      <Field id="checkIn" label="Check-in ab" error={errors.checkIn}>
        <input id="checkIn" name="checkIn" type="time" class="input" value={gig.checkIn} />
      </Field>
      <div class="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:gap-8">
        <Checkbox name="breakfast" label="Frühstück inklusive" checked={gig.breakfast === 1} />
        <Checkbox
          name="accommodationPaid"
          label="Zahlt der Veranstalter"
          checked={gig.accommodationPaid === 1}
        />
      </div>
      <div class="sm:col-span-2">
        <Field id="accommodationNotes" label="Notizen">
          <textarea
            id="accommodationNotes"
            name="accommodationNotes"
            rows="2"
            class="input"
            placeholder="Schlafsäcke mitbringen, Schlüsselübergabe …"
            >{gig.accommodationNotes}</textarea
          >
        </Field>
      </div>
    </div>
  {/snippet}
</Section>

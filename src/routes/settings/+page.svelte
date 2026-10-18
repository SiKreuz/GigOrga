<script lang="ts">
  import { enhance } from "$app/forms";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import Field from "$lib/components/Field.svelte";
  import SectionCard from "$lib/components/SectionCard.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import Select from "$lib/components/Select.svelte";
  import { formatNumber } from "$lib/format";
  import { fuelTypes } from "$lib/labels";
  import type { CarSummary } from "$lib/server/services/cars";
  import { Car, Plus, Settings, Trash2 } from "@lucide/svelte";

  let { data, form } = $props();

  const errorsFor = (name: string): Record<string, string> =>
    form && form.form === name && "errors" in form ? (form.errors ?? {}) : {};
  let adding = $state(false);
</script>

<svelte:head>
  <title>Einstellungen · GigOrga</title>
</svelte:head>

{#snippet carFields(car: CarSummary | undefined, errors: Record<string, string>, prefix: string)}
  <div class="grid gap-3 sm:grid-cols-[1fr_7rem_9rem_6rem]">
    <Field id="{prefix}-name" label="Name" error={errors.name}>
      <input
        id="{prefix}-name"
        name="name"
        class="input"
        value={car?.name ?? ""}
        placeholder="z. B. Bandbus"
        required
      />
    </Field>
    <Field id="{prefix}-fuel" label="Kraftstoff">
      <Select id="{prefix}-fuel" name="fuel" options={fuelTypes} value={car?.fuel ?? "diesel"} />
    </Field>
    <Field id="{prefix}-consumption" label="Verbrauch (l/100 km)" error={errors.consumption}>
      <input
        id="{prefix}-consumption"
        name="consumption"
        class="input"
        inputmode="decimal"
        value={formatNumber(car?.consumption ?? null)}
        required
      />
    </Field>
    <Field id="{prefix}-seats" label="Sitze" error={errors.seats}>
      <input
        id="{prefix}-seats"
        name="seats"
        class="input"
        inputmode="numeric"
        value={formatNumber(car?.seats ?? null)}
      />
    </Field>
  </div>
  <Checkbox
    name="standard"
    label="Standardmäßig bei neuen Gigs dabei"
    checked={car ? car.standard === 1 : true}
  />
{/snippet}

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <h1 class="text-2xl font-semibold tracking-tight">Einstellungen</h1>

  <SectionCard
    id="band"
    title="Band"
    icon={Settings}
    description="Standardwerte – pro Gig anpassbar."
  >
    <SectionForm action="?/settings">
      <Field
        id="homeAddress"
        label="Startadresse (Proberaum)"
        hint="Von hier aus wird die Route zur Venue berechnet."
      >
        <input
          id="homeAddress"
          name="homeAddress"
          class="input"
          value={data.settings.homeAddress}
          placeholder="Straße, PLZ Ort"
        />
      </Field>
      <div class="grid gap-4 sm:grid-cols-3">
        <Field id="bandSize" label="Personen in der Band" error={errorsFor("settings").bandSize}>
          <input
            id="bandSize"
            name="bandSize"
            class="input"
            inputmode="numeric"
            value={data.settings.bandSize}
          />
        </Field>
        <Field id="dieselPrice" label="Diesel (€/l)" error={errorsFor("settings").dieselPrice}>
          <input
            id="dieselPrice"
            name="dieselPrice"
            class="input"
            inputmode="decimal"
            value={formatNumber(data.settings.dieselPrice)}
          />
        </Field>
        <Field id="petrolPrice" label="Benzin (€/l)" error={errorsFor("settings").petrolPrice}>
          <input
            id="petrolPrice"
            name="petrolPrice"
            class="input"
            inputmode="decimal"
            value={formatNumber(data.settings.petrolPrice)}
          />
        </Field>
      </div>
    </SectionForm>
  </SectionCard>

  <SectionCard
    id="autos"
    title="Autos"
    icon={Car}
    description="Pro Gig wählst du aus, welche Autos fahren."
  >
    <div class="flex flex-col gap-4">
      {#each data.cars as car (car.id)}
        <div class="rounded-xl border border-border bg-bg p-4">
          <SectionForm action="?/updateCar">
            <input type="hidden" name="id" value={car.id} />
            {@render carFields(car, errorsFor(car.id), car.id)}
            {#snippet extra()}
              <div class="mr-auto">
                <ConfirmButton
                  message="Auto „{car.name}“ löschen?"
                  label="Löschen"
                  formaction="?/deleteCar"
                >
                  <Trash2 class="size-4" />
                </ConfirmButton>
              </div>
            {/snippet}
          </SectionForm>
        </div>
      {:else}
        {#if !adding}<p class="text-sm text-muted">Noch keine Autos angelegt.</p>{/if}
      {/each}

      {#if adding || (form?.form === "new" && !form.success)}
        <form
          method="POST"
          action="?/createCar"
          class="flex flex-col gap-4 rounded-xl border border-accent/40 p-4"
          use:enhance={() =>
            async ({ result, update }) => {
              await update();
              if (result.type === "success") adding = false;
            }}
        >
          {@render carFields(undefined, errorsFor("new"), "new")}
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" onclick={() => (adding = false)}
              >Abbrechen</button
            >
            <button class="btn btn-primary">Auto anlegen</button>
          </div>
        </form>
      {:else}
        <div>
          <button class="btn btn-ghost" onclick={() => (adding = true)}
            ><Plus class="size-4" /> Auto hinzufügen</button
          >
        </div>
      {/if}
    </div>
  </SectionCard>
</div>

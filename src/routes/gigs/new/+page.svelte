<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import Field from "$lib/components/Field.svelte";
  import { gigStatuses } from "$lib/labels";
  import type { GigStatus } from "$lib/labels";

  let { data, form } = $props();

  const statuses: GigStatus[] = ["anfrage", "option", "bestaetigt", "vertrag"];
  let status = $derived(form?.values?.status ?? "bestaetigt");
  let venueName = $state("");
  const known = $derived(
    data.venues.some((venue) => venue.name.toLowerCase() === venueName.trim().toLowerCase()),
  );
</script>

<svelte:head>
  <title>Neuer Gig · GigOrga</title>
</svelte:head>

<div class="mx-auto max-w-lg">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Neuer Gig</h1>
  <form method="POST" use:enhance class="flex flex-col gap-5 card p-5 sm:p-6">
    <Field id="date" label="Wann?" error={form?.errors?.date}>
      <input
        id="date"
        name="date"
        type="date"
        class="input"
        value={form?.values?.date ?? ""}
        required
      />
    </Field>
    <Field
      id="venueName"
      label="Wo?"
      error={form?.errors?.venueName}
      hint={venueName.trim() && !known
        ? "Neue Venue – Adresse kannst du später ergänzen."
        : undefined}
    >
      <input
        id="venueName"
        name="venueName"
        class="input"
        list="venues"
        placeholder="Venue"
        autocomplete="off"
        bind:value={venueName}
      />
      <datalist id="venues">
        {#each data.venues as venue (venue.id)}<option value={venue.name}>{venue.city}</option
          >{/each}
      </datalist>
    </Field>
    <Field id="title" label="Name" hint="Optional – sonst wird der Venue-Name verwendet.">
      <input
        id="title"
        name="title"
        class="input"
        value={form?.values?.title ?? ""}
        placeholder="z. B. Release-Show"
      />
    </Field>
    <fieldset class="flex flex-col gap-1.5">
      <legend class="mb-1.5 label">Status</legend>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {#each statuses as key (key)}
          <label
            class={[
              "cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors",
              status === key
                ? "border-accent bg-accent-soft font-medium text-accent"
                : "border-border hover:bg-surface-2",
            ]}
          >
            <input type="radio" name="status" value={key} class="sr-only" bind:group={status} />
            {gigStatuses[key]}
          </label>
        {/each}
      </div>
    </fieldset>
    <div class="flex justify-end gap-2 border-t border-border pt-4">
      <a href={resolve("/")} class="btn btn-ghost">Abbrechen</a>
      <button type="submit" class="btn btn-primary">Gig anlegen</button>
    </div>
  </form>
</div>

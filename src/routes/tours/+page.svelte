<script lang="ts">
  import { enhance } from "$app/forms";
  import Field from "$lib/components/Field.svelte";
  import { formatDate } from "$lib/format";
  import { ChevronRight, Plus, Route } from "@lucide/svelte";

  let { data, form } = $props();
  let creating = $state(false);
</script>

<svelte:head>
  <title>Touren · GigOrga</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight">Touren</h1>
    {#if !creating && !form}
      <button class="btn btn-primary" onclick={() => (creating = true)}
        ><Plus class="size-4" /> Neue Tour</button
      >
    {/if}
  </div>

  {#if creating || form}
    <form method="POST" use:enhance class="flex flex-col gap-4 card p-5 sm:p-6">
      <Field id="name" label="Name der Tour" error={form?.errors.name}>
        <input
          id="name"
          name="name"
          class="input"
          value={form?.values.name ?? ""}
          placeholder="z. B. Herbsttour 2026"
          required
        />
      </Field>
      <div class="flex justify-end gap-2">
        <a href="/tours" class="btn btn-ghost" onclick={() => (creating = false)}>Abbrechen</a>
        <button class="btn btn-primary">Anlegen</button>
      </div>
    </form>
  {/if}

  {#if data.tours.length > 0}
    <div class="divide-y divide-border overflow-hidden card">
      {#each data.tours as tour (tour.id)}
        <a href="/tours/{tour.id}" class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2">
          <span
            class="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent"
            ><Route class="size-4" /></span
          >
          <div class="min-w-0 flex-1">
            <div class="font-medium">{tour.name}</div>
            <div class="text-sm text-muted">
              {#if tour.start && tour.end}
                {formatDate(tour.start)}{tour.end === tour.start
                  ? ""
                  : ` – ${formatDate(tour.end)}`}
                · {tour.gigCount}
                {tour.gigCount === 1 ? "Gig" : "Gigs"}
              {:else}
                Noch keine Gigs
              {/if}
            </div>
          </div>
          <ChevronRight class="size-4 text-muted" />
        </a>
      {/each}
    </div>
  {:else if !creating}
    <p class="text-sm text-muted">
      Noch keine Touren. Eine Tour fasst Gigs zusammen, zwischen denen ihr direkt weiterfahrt.
    </p>
  {/if}
</div>

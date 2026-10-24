<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { allowed } from "$lib/access.svelte";
  import VenueFields from "$lib/components/VenueFields.svelte";
  import { Building2, ChevronRight, Plus } from "@lucide/svelte";

  let { data, form } = $props();
  let creating = $state(false);
</script>

<svelte:head>
  <title>Venues · GigOrga</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight">Venues</h1>
    {#if !creating && !form && allowed("edit")}
      <button type="button" class="btn btn-primary" onclick={() => (creating = true)}
        ><Plus class="size-4" /> Neue Venue</button
      >
    {/if}
  </div>

  {#if creating || form}
    <form method="POST" use:enhance class="flex flex-col gap-4 card p-5 sm:p-6">
      <h2 class="font-semibold">Neue Venue</h2>
      <VenueFields values={form?.values} errors={form?.errors} />
      <div class="flex justify-end gap-2">
        <a href={resolve("/venues")} class="btn btn-ghost" onclick={() => (creating = false)}
          >Abbrechen</a
        >
        <button type="submit" class="btn btn-primary">Anlegen</button>
      </div>
    </form>
  {/if}

  {#if data.venues.length > 0}
    <div class="divide-y divide-border overflow-hidden card">
      {#each data.venues as venue (venue.id)}
        <a
          href={resolve("/venues/[id]", { id: venue.id })}
          class="group flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2"
        >
          <span
            class="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent"
            ><Building2 class="size-4" /></span
          >
          <div class="min-w-0 flex-1">
            <div class="font-medium">{venue.name}</div>
            <div class="text-sm text-muted">
              {[venue.city, venue.capacity ? `${venue.capacity} Pers.` : ""]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <ChevronRight class="size-4 text-muted" />
        </a>
      {/each}
    </div>
  {:else if !creating}
    <p class="text-sm text-muted">Noch keine Venues angelegt.</p>
  {/if}
</div>

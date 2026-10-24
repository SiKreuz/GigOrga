<script lang="ts">
  import { resolve } from "$app/paths";
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import StatusChip from "$lib/components/StatusChip.svelte";
  import VenueFields from "$lib/components/VenueFields.svelte";
  import { formatDate } from "$lib/format";
  import { ArrowLeft } from "@lucide/svelte";

  let { data, form } = $props();
</script>

<svelte:head>
  <title>{data.venue.name} · GigOrga</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <div>
    <a
      href={resolve("/venues")}
      class="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      ><ArrowLeft class="size-4" /> Alle Venues</a
    >
    <h1 class="text-2xl font-semibold tracking-tight">{data.venue.name}</h1>
  </div>
  <div class="card p-5 sm:p-6">
    <SectionForm action="?/update">
      <VenueFields venue={data.venue} errors={form?.errors} />
      {#snippet extra()}
        <div class="mr-auto">
          <ConfirmButton
            message="Venue löschen? Die Gigs bleiben erhalten."
            label="Venue löschen"
            formaction="?/delete"
          />
        </div>
      {/snippet}
    </SectionForm>
  </div>
  {#if data.venue.gigs.length > 0}
    <section>
      <h2 class="mb-2 px-1 text-sm font-semibold text-muted">Gigs hier</h2>
      <div class="divide-y divide-border overflow-hidden card">
        {#each data.venue.gigs as gig (gig.id)}
          <a
            href={resolve("/gigs/[id]", { id: gig.id })}
            class="flex items-center gap-3 px-5 py-3 hover:bg-surface-2"
          >
            <span class="w-28 text-sm text-muted tabular-nums">{formatDate(gig.date)}</span>
            <span class="flex-1 font-medium">{gig.title}</span>
            <StatusChip status={gig.status} />
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>

<script lang="ts">
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import Field from "$lib/components/Field.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import Select from "$lib/components/Select.svelte";
  import { gigStatuses, gigTypes } from "$lib/labels";
  import type { GigDetail } from "$lib/server/services/gigs";

  let {
    gig,
    venues,
    tours,
    errors,
    onclose,
  }: {
    gig: GigDetail;
    venues: { id: string; name: string; city: string }[];
    tours: { id: string; name: string }[];
    errors: Record<string, string>;
    onclose: () => void;
  } = $props();
</script>

<div id="basis" class="card p-5 sm:p-6">
  <SectionForm action="?/basics" onsaved={onclose} oncancel={onclose}>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <Field id="title" label="Name / Event" error={errors.title}>
          <input id="title" name="title" class="input" value={gig.title} required />
        </Field>
      </div>
      <Field id="date" label="Datum" error={errors.date}>
        <input id="date" name="date" type="date" class="input" value={gig.date} required />
      </Field>
      <Field id="venueId" label="Venue">
        <select id="venueId" name="venueId" class="input" value={gig.venueId ?? ""}>
          <option value="">– noch offen –</option>
          {#each venues as venue (venue.id)}
            <option value={venue.id}>{venue.name}{venue.city ? ` (${venue.city})` : ""}</option>
          {/each}
        </select>
      </Field>
      <Field id="status" label="Status">
        <Select id="status" options={gigStatuses} value={gig.status} />
      </Field>
      <Field id="type" label="Art">
        <Select id="type" options={gigTypes} value={gig.type} />
      </Field>
      <Field id="tourId" label="Tour" hint="Auf Tour fährt ihr von Gig zu Gig statt nach Hause.">
        <select id="tourId" name="tourId" class="input" value={gig.tourId ?? ""}>
          <option value="">– keine –</option>
          {#each tours as tour (tour.id)}
            <option value={tour.id}>{tour.name}</option>
          {/each}
        </select>
      </Field>
      <div class="sm:col-span-2">
        <Field id="notes" label="Notizen">
          <textarea id="notes" name="notes" rows="3" class="input">{gig.notes}</textarea>
        </Field>
      </div>
    </div>
    {#snippet extra()}
      <div class="mr-auto">
        <ConfirmButton
          message="Diesen Gig wirklich löschen?"
          label="Gig löschen"
          formaction="?/delete"
        />
      </div>
    {/snippet}
  </SectionForm>
</div>

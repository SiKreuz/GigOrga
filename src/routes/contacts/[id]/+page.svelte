<script lang="ts">
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import ContactFields from "$lib/components/ContactFields.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import { ArrowLeft } from "@lucide/svelte";

  let { data, form } = $props();
</script>

<svelte:head>
  <title>{data.contact.name} · GigOrga</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <div>
    <a
      href="/contacts"
      class="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      ><ArrowLeft class="size-4" /> Alle Kontakte</a
    >
    <h1 class="text-2xl font-semibold tracking-tight">{data.contact.name}</h1>
  </div>
  <div class="card p-5 sm:p-6">
    <SectionForm action="?/update">
      <ContactFields contact={data.contact} errors={form?.errors} />
      {#snippet extra()}
        <div class="mr-auto">
          <ConfirmButton message="Kontakt löschen?" label="Kontakt löschen" formaction="?/delete" />
        </div>
      {/snippet}
    </SectionForm>
  </div>
</div>

<script lang="ts">
  import { enhance } from "$app/forms";
  import { allowed } from "$lib/access.svelte";
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import Field from "$lib/components/Field.svelte";
  import SectionCard from "$lib/components/SectionCard.svelte";
  import SectionForm from "$lib/components/SectionForm.svelte";
  import type { SongSummary } from "$lib/server/services/songs";
  import { formatSongDuration } from "$lib/setlist";
  import { Music, Plus, Trash2 } from "@lucide/svelte";

  let { data, form } = $props();

  const errorsFor = (name: string): Record<string, string> =>
    form && form.form === name && "errors" in form ? (form.errors ?? {}) : {};
  let adding = $state(false);
</script>

<svelte:head>
  <title>Songs · GigOrga</title>
</svelte:head>

{#snippet songFields(song: SongSummary | undefined, errors: Record<string, string>, prefix: string)}
  <div class="grid gap-3 sm:grid-cols-[1fr_6rem]">
    <Field id="{prefix}-title" label="Titel" error={errors.title}>
      <input id="{prefix}-title" name="title" class="input" value={song?.title ?? ""} required />
    </Field>
    <Field id="{prefix}-duration" label="Dauer (m:ss)" error={errors.duration}>
      <input
        id="{prefix}-duration"
        name="duration"
        class="input tabular-nums"
        inputmode="numeric"
        value={song ? formatSongDuration(song.durationSec) : ""}
        placeholder="3:45"
        required
      />
    </Field>
  </div>
  <Field id="{prefix}-notes" label="Notiz" error={errors.notes}>
    <input id="{prefix}-notes" name="notes" class="input" value={song?.notes ?? ""} />
  </Field>
{/snippet}

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <h1 class="text-2xl font-semibold tracking-tight">Songs</h1>

  <SectionCard
    id="songs"
    title="Repertoire"
    icon={Music}
    description="Aus diesen Songs stellst du die Setlist pro Gig zusammen."
  >
    <div class="flex flex-col gap-4">
      {#each data.songs as song (song.id)}
        <div class="rounded-xl border border-border bg-bg p-4">
          <SectionForm action="?/update">
            <input type="hidden" name="id" value={song.id} />
            {@render songFields(song, errorsFor(song.id), song.id)}
            {#snippet extra()}
              <div class="mr-auto">
                <ConfirmButton
                  message="Song „{song.title}“ löschen? Er verschwindet auch aus allen Setlists."
                  label="Löschen"
                  formaction="?/delete"
                >
                  <Trash2 class="size-4" />
                </ConfirmButton>
              </div>
            {/snippet}
          </SectionForm>
        </div>
      {:else}
        {#if !adding}<p class="text-sm text-muted">Noch keine Songs angelegt.</p>{/if}
      {/each}

      {#if allowed("edit")}
        {#if adding || (form?.form === "new" && !form.success)}
          <form
            method="POST"
            action="?/create"
            class="flex flex-col gap-4 rounded-xl border border-accent/40 p-4"
            use:enhance={() =>
              async ({ result, update }) => {
                await update();
                if (result.type === "success") adding = false;
              }}
          >
            {@render songFields(undefined, errorsFor("new"), "new")}
            <div class="flex justify-end gap-2">
              <button type="button" class="btn btn-ghost" onclick={() => (adding = false)}
                >Abbrechen</button
              >
              <button class="btn btn-primary">Song anlegen</button>
            </div>
          </form>
        {:else}
          <div>
            <button class="btn btn-ghost" onclick={() => (adding = true)}
              ><Plus class="size-4" /> Song hinzufügen</button
            >
          </div>
        {/if}
      {/if}
    </div>
  </SectionCard>
</div>

<script lang="ts">
  import Field from "$lib/components/Field.svelte";
  import Section from "$lib/components/Section.svelte";
  import Select from "$lib/components/Select.svelte";
  import type { GigDetail } from "$lib/server/services/gigs";
  import type { SoundEngineerSummary } from "$lib/server/services/soundEngineers";
  import { Headphones, Mail, Phone } from "@lucide/svelte";

  let {
    gig,
    soundEngineers,
    editing = $bindable(false),
  }: { gig: GigDetail; soundEngineers: SoundEngineerSummary[]; editing?: boolean } = $props();

  const options = $derived({
    "": "— keiner —",
    ...(gig.soundEngineer && { [gig.soundEngineer.id]: gig.soundEngineer.name }),
    ...Object.fromEntries(soundEngineers.map((engineer) => [engineer.id, engineer.name])),
  });
</script>

<Section id="tontechnik" title="Tontechnik" icon={Headphones} action="?/soundEngineer" bind:editing>
  {#snippet summary()}
    {#if gig.soundEngineer}
      <div class="text-sm">
        <div class="font-medium">{gig.soundEngineer.name}</div>
        <div class="mt-0.5 flex flex-wrap gap-x-4 text-muted">
          {#if gig.soundEngineer.phone}
            <a
              href="tel:{gig.soundEngineer.phone}"
              class="flex items-center gap-1 hover:text-accent"
              ><Phone class="size-3.5" />{gig.soundEngineer.phone}</a
            >
          {/if}
          {#if gig.soundEngineer.email}
            <a
              href="mailto:{gig.soundEngineer.email}"
              class="flex items-center gap-1 hover:text-accent"
              ><Mail class="size-3.5" />{gig.soundEngineer.email}</a
            >
          {/if}
        </div>
      </div>
    {/if}
  {/snippet}
  {#snippet form()}
    <Field
      id="soundEngineerId"
      label="Wer mischt?"
      hint={soundEngineers.length === 0
        ? "Tontechniker legst du in den Einstellungen an."
        : undefined}
    >
      <Select id="soundEngineerId" {options} value={gig.soundEngineer?.id ?? ""} />
    </Field>
  {/snippet}
</Section>

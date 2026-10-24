<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Field from "$lib/components/Field.svelte";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import Section from "$lib/components/Section.svelte";
  import Select from "$lib/components/Select.svelte";
  import { houseEngineer } from "$lib/forms";
  import { backlineProviders } from "$lib/labels";
  import type { BacklineProvider } from "$lib/labels";
  import type { BacklineRow } from "$lib/server/services/gigInputs";
  import type { GigDetail } from "$lib/server/services/gigs";
  import type { SoundEngineerSummary } from "$lib/server/services/soundEngineers";
  import { Check, Drum, Headphones, Mail, Phone, X } from "@lucide/svelte";

  let {
    gig,
    soundEngineers,
    errors,
    editing = $bindable(false),
  }: {
    gig: GigDetail;
    soundEngineers: SoundEngineerSummary[];
    errors: Record<string, string>;
    editing?: boolean;
  } = $props();

  const blank = (): BacklineRow => ({ name: "", provider: "unklar", note: "" });
  const tone: Record<BacklineProvider, string> = {
    unklar: "bg-warning-soft text-warning",
    venue: "bg-success-soft text-success",
    wir: "bg-accent-soft text-accent",
    support: "bg-surface-2 text-text",
  };
  const engineerOptions = $derived({
    "": "– offen –",
    [houseEngineer]: "Haustechniker",
    ...(gig.soundEngineer && { [gig.soundEngineer.id]: gig.soundEngineer.name }),
    ...Object.fromEntries(soundEngineers.map((engineer) => [engineer.id, engineer.name])),
  });
  const engineerChoice = $derived(
    gig.soundEngineer?.id ?? (gig.houseEngineer === 1 ? houseEngineer : ""),
  );
  const checks = $derived([
    { label: "Tech Rider", done: gig.riderSent === 1 },
    { label: "Stageplot", done: gig.stagePlotSent === 1 },
    { label: "Inputliste", done: gig.inputListSent === 1 },
  ]);
</script>

<Section id="technik" title="Technik & Backline" icon={Drum} action="?/tech" bind:editing>
  {#snippet summary()}
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span class="flex items-center gap-1.5">
          <Headphones class="size-3.5 text-muted" />
          {#if gig.soundEngineer}
            <span class="font-medium">{gig.soundEngineer.name}</span>
          {:else if gig.houseEngineer === 1}
            Haustechniker
          {:else}
            <span class="text-warning">Tontechnik offen</span>
          {/if}
        </span>
        {#if gig.soundEngineer?.phone}
          <a
            href="tel:{gig.soundEngineer.phone}"
            class="flex items-center gap-1 text-muted hover:text-accent"
            ><Phone class="size-3.5" />{gig.soundEngineer.phone}</a
          >
        {/if}
        {#if gig.soundEngineer?.email}
          <a
            href="mailto:{gig.soundEngineer.email}"
            class="flex items-center gap-1 text-muted hover:text-accent"
            ><Mail class="size-3.5" />{gig.soundEngineer.email}</a
          >
        {/if}
      </div>
      {#if gig.backline.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each gig.backline as item (item.id)}
            <span
              class={["rounded-lg px-2.5 py-1 text-sm", tone[item.provider]]}
              title={item.note || undefined}
            >
              <span class="font-medium">{item.name}</span>
              · {backlineProviders[item.provider]}{item.note ? ` (${item.note})` : ""}
            </span>
          {/each}
        </div>
      {/if}
      <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {#each checks as check (check.label)}
          <span class={["flex items-center gap-1", check.done ? "text-success" : "text-muted"]}>
            {#if check.done}<Check class="size-3.5" />{:else}<X class="size-3.5" />{/if}
            {check.label}
            {check.done ? "verschickt" : "offen"}
          </span>
        {/each}
      </div>
      {#if gig.techNotes}<p class="text-sm whitespace-pre-line">{gig.techNotes}</p>{/if}
    </div>
  {/snippet}
  {#snippet form()}
    <ListEditor name="backline" initial={gig.backline} {blank} addLabel="Position hinzufügen">
      {#snippet row(item: BacklineRow)}
        <div class="grid gap-2 sm:grid-cols-[11rem_11rem_1fr]">
          <input
            class="input font-medium"
            bind:value={item.name}
            placeholder="z. B. Drumset"
            aria-label="Bezeichnung"
            required
          />
          <select
            class={["input font-medium", tone[item.provider]]}
            bind:value={item.provider}
            aria-label="Wer stellt"
          >
            {#each Object.entries(backlineProviders) as [key, text] (key)}
              <option value={key}>{text}</option>
            {/each}
          </select>
          <input
            class="input"
            bind:value={item.note}
            placeholder="Notiz (z. B. ohne Becken)"
            aria-label="Notiz"
          />
        </div>
      {/snippet}
    </ListEditor>
    {#if errors.backline}<span class="text-sm text-danger">{errors.backline}</span>{/if}
    <div class="border-t border-border pt-5">
      <Field
        id="soundEngineer"
        label="Tontechnik (FOH)"
        hint={soundEngineers.length === 0
          ? "Eigene Tontechniker legst du in den Einstellungen an."
          : undefined}
      >
        <Select id="soundEngineer" options={engineerOptions} value={engineerChoice} />
      </Field>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Checkbox name="riderSent" label="Tech Rider verschickt" checked={gig.riderSent === 1} />
      <Checkbox
        name="stagePlotSent"
        label="Stageplot verschickt"
        checked={gig.stagePlotSent === 1}
      />
      <Checkbox
        name="inputListSent"
        label="Inputliste verschickt"
        checked={gig.inputListSent === 1}
      />
    </div>
    <Field id="techNotes" label="Technik-Notizen">
      <textarea
        id="techNotes"
        name="techNotes"
        rows="3"
        class="input"
        placeholder="Monitoring, Strom, Licht …">{gig.techNotes}</textarea
      >
    </Field>
  {/snippet}
</Section>

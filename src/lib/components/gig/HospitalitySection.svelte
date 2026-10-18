<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Fact from "$lib/components/Fact.svelte";
  import Field from "$lib/components/Field.svelte";
  import Section from "$lib/components/Section.svelte";
  import { formatMoney, formatNumber } from "$lib/format";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { UtensilsCrossed } from "@lucide/svelte";

  let {
    gig,
    errors,
    editing = $bindable(false),
  }: { gig: GigDetail; errors: Record<string, string>; editing?: boolean } = $props();
</script>

<Section
  id="hospitality"
  title="Essen & Getränke"
  icon={UtensilsCrossed}
  action="?/hospitality"
  bind:editing
>
  {#snippet summary()}
    <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      <Fact label="Essen">{gig.catering ? "Catering vor Ort" : "kein Catering"}</Fact>
      {#if gig.buyout !== null}<Fact label="Essensgeld (Buyout)">{formatMoney(gig.buyout)}</Fact
        >{/if}
      {#if gig.drinks}<Fact label="Getränke">{gig.drinks}</Fact>{/if}
      {#if gig.hospitalityNotes}<Fact label="Notizen" wide>{gig.hospitalityNotes}</Fact>{/if}
    </dl>
  {/snippet}
  {#snippet form()}
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="flex items-end pb-2.5">
        <Checkbox name="catering" label="Catering / Essen vor Ort" checked={gig.catering === 1} />
      </div>
      <Field
        id="buyout"
        label="Essensgeld / Buyout (€)"
        error={errors.buyout}
        hint="Geld statt Catering, gesamt"
      >
        <input
          id="buyout"
          name="buyout"
          class="input"
          inputmode="decimal"
          value={formatNumber(gig.buyout)}
        />
      </Field>
      <Field id="drinks" label="Getränke">
        <input
          id="drinks"
          name="drinks"
          class="input"
          value={gig.drinks}
          placeholder="z. B. frei, 5 Bons p. P."
        />
      </Field>
    </div>
    <Field id="hospitalityNotes" label="Notizen">
      <textarea
        id="hospitalityNotes"
        name="hospitalityNotes"
        rows="2"
        class="input"
        placeholder="Backstage, Allergien, Gästeliste …">{gig.hospitalityNotes}</textarea
      >
    </Field>
  {/snippet}
</Section>

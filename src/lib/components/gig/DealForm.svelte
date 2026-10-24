<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Field from "$lib/components/Field.svelte";
  import ListEditor from "$lib/components/ListEditor.svelte";
  import Select from "$lib/components/Select.svelte";
  import { estimate } from "$lib/deal";
  import { formatMoney, formatNumber, parseNumber } from "$lib/format";
  import { dealTypes, invoiceStatuses } from "$lib/labels";
  import type { DealType } from "$lib/labels";
  import type { PresaleLinkRow } from "$lib/server/services/gigInputs";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { untrack } from "svelte";

  let {
    gig,
    travel,
    people,
    errors,
  }: {
    gig: GigDetail;
    travel: number | null;
    people: number;
    errors: Record<string, string>;
  } = $props();

  let terms = $state(
    untrack(() => ({
      dealType: gig.dealType as string,
      fee: formatNumber(gig.fee),
      doorPercent: formatNumber(gig.doorPercent),
      costs: formatNumber(gig.costs),
      rent: formatNumber(gig.rent),
      ticketPresale: formatNumber(gig.ticketPresale),
      ticketDoor: formatNumber(gig.ticketDoor),
      expectedAttendance: formatNumber(gig.expectedAttendance),
    })),
  );

  const dealType = $derived(terms.dealType as DealType);
  const uses = $derived({
    fee: ["festgage", "versus", "hut"].includes(dealType),
    percent: ["tuerdeal", "versus"].includes(dealType),
    costs: ["tuerdeal", "versus", "saalmiete"].includes(dealType),
    rent: dealType === "saalmiete",
    tickets: dealType !== "festgage" && dealType !== "unbezahlt",
  });

  const result = $derived(
    estimate(
      {
        dealType,
        fee: parseNumber(terms.fee),
        doorPercent: parseNumber(terms.doorPercent),
        costs: parseNumber(terms.costs),
        rent: parseNumber(terms.rent),
        ticketPresale: parseNumber(terms.ticketPresale),
        ticketDoor: parseNumber(terms.ticketDoor),
        expectedAttendance: parseNumber(terms.expectedAttendance),
      },
      travel,
      people,
    ),
  );

  const feeLabels: Partial<Record<DealType, string>> = {
    versus: "Garantie (€)",
    hut: "Erwartet im Hut (€)",
  };
  const feeLabel = $derived(feeLabels[dealType] ?? "Gage (€)");

  const descriptions: Record<DealType, string> = {
    festgage: "Fester Betrag, unabhängig vom Ticketverkauf.",
    tuerdeal: "Wir bekommen einen Prozentsatz der Ticketeinnahmen, ggf. nach Abzug der Kosten.",
    versus: "Garantie oder Prozent der Tür – je nachdem, was höher ist.",
    saalmiete: "Wir zahlen Miete und behalten dafür alle Ticketeinnahmen.",
    hut: "Keine feste Gage, Einnahmen über Hut oder Spenden.",
    unbezahlt: "Kein Geld – z. B. Promo- oder Benefiz-Gig.",
  };

  const blank = (): PresaleLinkRow => ({ label: "", url: "" });
</script>

{#snippet money(id: string, label: string, key: keyof typeof terms, hint?: string)}
  <Field {id} {label} error={errors[id]} {hint}>
    <input {id} name={id} class="input" inputmode="decimal" bind:value={terms[key]} />
  </Field>
{/snippet}

<div class="grid gap-6 lg:grid-cols-[1fr_17rem]">
  <div class="flex flex-col gap-4">
    <Field id="dealType" label="Deal" hint={descriptions[dealType]}>
      <Select id="dealType" options={dealTypes} bind:value={terms.dealType} />
    </Field>
    <div class="grid gap-4 sm:grid-cols-2">
      {#if uses.fee}{@render money("fee", feeLabel, "fee")}{/if}
      {#if uses.percent}{@render money("doorPercent", "Anteil Tür (%)", "doorPercent")}{/if}
      {#if uses.rent}{@render money("rent", "Miete (€)", "rent")}{/if}
      {#if uses.costs}
        {@render money("costs", "Abzüge / Kosten (€)", "costs", "z. B. Technik, Personal")}
      {/if}
    </div>
    <div class="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
      {@render money("ticketPresale", "Ticket VVK (€)", "ticketPresale")}
      {@render money("ticketDoor", "Ticket AK (€)", "ticketDoor")}
      {#if uses.tickets}
        <Field
          id="expectedAttendance"
          label="Erwartete Besucher"
          error={errors.expectedAttendance}
          hint={gig.venue?.capacity ? `Kapazität ${gig.venue.capacity}` : undefined}
        >
          <input
            id="expectedAttendance"
            name="expectedAttendance"
            class="input"
            inputmode="numeric"
            bind:value={terms.expectedAttendance}
          />
        </Field>
      {/if}
    </div>
  </div>

  <aside class="flex flex-col gap-2 self-start rounded-xl bg-accent-soft p-4 text-sm">
    <div class="mb-1 text-xs font-semibold tracking-wide text-accent uppercase">Kalkulation</div>
    {#if result.revenue !== null && uses.tickets}
      <div class="flex justify-between">
        <span class="text-muted">Ticketumsatz</span><span>{formatMoney(result.revenue)}</span>
      </div>
    {/if}
    <div class="flex justify-between">
      <span class="text-muted">Unsere Einnahmen</span><span>{formatMoney(result.income)}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted">Fahrtkosten</span>
      <span>{result.travel === null ? "–" : `− ${formatMoney(result.travel)}`}</span>
    </div>
    <div class="mt-1 flex justify-between border-t border-accent/20 pt-2 text-base font-semibold">
      <span>Netto</span>
      <span class={result.net !== null && result.net < 0 ? "text-danger" : ""}
        >{formatMoney(result.net)}</span
      >
    </div>
    <div class="flex justify-between">
      <span class="text-muted">pro Person ({people})</span><span
        >{formatMoney(result.perPerson)}</span
      >
    </div>
    {#if result.breakEven !== null}
      <div class="mt-2 rounded-lg bg-surface/70 p-2.5 text-xs">
        {#if dealType === "versus"}
          Ab <strong>{result.breakEven} Tickets</strong> liegt der Prozentanteil über der Garantie.
        {:else}
          Ab <strong>{result.breakEven} Tickets</strong> sind Kosten und Fahrt gedeckt.
        {/if}
      </div>
    {/if}
  </aside>
</div>

<div class="flex flex-col gap-2 border-t border-border pt-5">
  <span class="label">Vorverkaufs-Links</span>
  <ListEditor name="presaleLinks" initial={gig.presaleLinks} {blank} addLabel="Link hinzufügen">
    {#snippet row(item: PresaleLinkRow)}
      <div class="grid gap-2 sm:grid-cols-[10rem_1fr]">
        <input
          class="input"
          bind:value={item.label}
          placeholder="z. B. Eventim"
          aria-label="Bezeichnung"
        />
        <input
          class="input"
          type="url"
          bind:value={item.url}
          placeholder="https://…"
          aria-label="URL"
          required
        />
      </div>
    {/snippet}
  </ListEditor>
  {#if errors.presaleLinks}<span class="text-sm text-danger">{errors.presaleLinks}</span>{/if}
</div>

<div class="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
  <Field id="deposit" label="Anzahlung (€)" error={errors.deposit}>
    <input
      id="deposit"
      name="deposit"
      class="input"
      inputmode="decimal"
      value={formatNumber(gig.deposit)}
    />
  </Field>
  <Field id="invoiceStatus" label="Rechnung">
    <Select id="invoiceStatus" options={invoiceStatuses} value={gig.invoiceStatus} />
  </Field>
  <div class="flex items-end pb-2.5">
    <Checkbox name="gemaReported" label="GEMA-Setliste gemeldet" checked={gig.gemaReported === 1} />
  </div>
</div>
<Field id="dealNotes" label="Notizen zum Deal">
  <textarea
    id="dealNotes"
    name="dealNotes"
    rows="2"
    class="input"
    placeholder="Merch-Provision, Gästeliste, Sonderabsprachen …">{gig.dealNotes}</textarea
  >
</Field>

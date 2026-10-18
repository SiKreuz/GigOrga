<script lang="ts">
  import Fact from "$lib/components/Fact.svelte";
  import Section from "$lib/components/Section.svelte";
  import { estimate } from "$lib/deal";
  import { formatMoney, formatNumber } from "$lib/format";
  import { dealTypes, invoiceStatuses } from "$lib/labels";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { Banknote, ExternalLink } from "@lucide/svelte";

  import DealForm from "./DealForm.svelte";

  let {
    gig,
    travel,
    people,
    errors,
    editing = $bindable(false),
  }: {
    gig: GigDetail;
    travel: number | null;
    people: number;
    errors: Record<string, string>;
    editing?: boolean;
  } = $props();

  const result = $derived(estimate(gig, travel, people));

  const terms = $derived.by(() => {
    const percent = gig.doorPercent === null ? "" : `${formatNumber(gig.doorPercent)} % der Tür`;
    const costs = gig.costs === null ? "" : `nach ${formatMoney(gig.costs)} Kosten`;
    switch (gig.dealType) {
      case "festgage":
      case "hut": {
        return gig.fee === null ? "" : formatMoney(gig.fee);
      }
      case "tuerdeal": {
        return [percent, costs].filter(Boolean).join(" ");
      }
      case "versus": {
        return [`${formatMoney(gig.fee)} Garantie`, percent && `vs. ${percent}`, costs]
          .filter(Boolean)
          .join(" ");
      }
      case "saalmiete": {
        return [
          `${formatMoney(gig.rent)} Miete`,
          gig.costs === null ? "" : `+ ${formatMoney(gig.costs)} Kosten`,
        ]
          .filter(Boolean)
          .join(" ");
      }
      case "unbezahlt": {
        return "";
      }
    }
  });

  const tickets = $derived(
    [
      gig.ticketPresale === null ? "" : `VVK ${formatMoney(gig.ticketPresale)}`,
      gig.ticketDoor === null ? "" : `AK ${formatMoney(gig.ticketDoor)}`,
      gig.expectedAttendance === null ? "" : `${gig.expectedAttendance} erwartet`,
    ].filter(Boolean),
  );
</script>

<Section id="deal" title="Deal & Tickets" icon={Banknote} action="?/deal" bind:editing>
  {#snippet summary()}
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="text-sm font-medium">{dealTypes[gig.dealType]}</div>
          {#if terms}<div class="text-sm text-muted">{terms}</div>{/if}
        </div>
        {#if result.net === null}
          <span class="text-sm text-muted">Gage noch offen</span>
        {:else}
          <div class="text-right">
            <div class={["text-xl font-semibold", result.net < 0 && "text-danger"]}>
              {formatMoney(result.net)}
            </div>
            <div class="text-xs text-muted">
              netto · {formatMoney(result.perPerson)} p. P. ({people})
            </div>
          </div>
        {/if}
      </div>
      <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        {#if tickets.length > 0}
          <Fact label="Tickets">{tickets.join(" · ")}</Fact>
        {/if}
        <Fact label="Rechnung"
          >{invoiceStatuses[gig.invoiceStatus]}{gig.deposit
            ? ` · ${formatMoney(gig.deposit)} Anzahlung`
            : ""}</Fact
        >
        <Fact label="GEMA">{gig.gemaReported ? "gemeldet" : "offen"}</Fact>
        {#if gig.presaleLinks.length > 0}
          <Fact label="Vorverkauf" wide>
            <span class="flex flex-wrap gap-x-4">
              {#each gig.presaleLinks as link (link.id)}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  {link.label || new URL(link.url).hostname}<ExternalLink class="size-3" />
                </a>
              {/each}
            </span>
          </Fact>
        {/if}
        {#if gig.dealNotes}<Fact label="Notizen" wide>{gig.dealNotes}</Fact>{/if}
      </dl>
      {#if result.breakEven !== null}
        <p class="rounded-lg bg-accent-soft px-3 py-2 text-xs">
          {#if gig.dealType === "versus"}
            Ab <strong>{result.breakEven} Tickets</strong> liegt der Prozentanteil über der Garantie.
          {:else}
            Ab <strong>{result.breakEven} Tickets</strong> sind Kosten und Fahrt gedeckt.
          {/if}
        </p>
      {/if}
    </div>
  {/snippet}
  {#snippet form()}
    <DealForm {gig} {travel} {people} {errors} />
  {/snippet}
</Section>

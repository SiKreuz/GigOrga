<script lang="ts">
  import ListEditor from "$lib/components/ListEditor.svelte";
  import OutboundLink from "$lib/components/OutboundLink.svelte";
  import Section from "$lib/components/Section.svelte";
  import type { SupportActRow } from "$lib/server/services/gigInputs";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { ExternalLink, Mic } from "@lucide/svelte";

  let {
    gig,
    errors,
    editing = $bindable(false),
  }: { gig: GigDetail; errors: Record<string, string>; editing?: boolean } = $props();

  const blank = (): SupportActRow => ({
    name: "",
    link: "",
    contact: "",
    stageTime: "",
    sharesBackline: 0,
  });
</script>

<Section id="lineup" title="Line-up" icon={Mic} action="?/lineup" bind:editing>
  {#snippet summary()}
    <ul class="flex flex-col gap-2 text-sm">
      {#each gig.supportActs as act (act.id)}
        <li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span class="w-12 text-muted tabular-nums">{act.stageTime || "–"}</span>
          <span class="font-medium">{act.name}</span>
          {#if act.link}
            <OutboundLink href={act.link} class="text-muted hover:text-accent" aria-label="Link">
              <ExternalLink class="size-3.5" />
            </OutboundLink>
          {/if}
          {#if act.sharesBackline}<span class="chip">teilt Backline</span>{/if}
          {#if act.contact}<span class="text-muted">{act.contact}</span>{/if}
        </li>
      {/each}
    </ul>
  {/snippet}
  {#snippet form()}
    <ListEditor name="acts" initial={gig.supportActs} {blank} addLabel="Support Act hinzufügen">
      {#snippet row(item: SupportActRow)}
        <div class="grid gap-2 sm:grid-cols-[1fr_7rem]">
          <input
            class="input"
            bind:value={item.name}
            placeholder="Name"
            aria-label="Name"
            required
          />
          <input type="time" class="input" bind:value={item.stageTime} aria-label="Spielzeit" />
          <input
            class="input"
            bind:value={item.link}
            placeholder="Link (Website, Instagram …)"
            aria-label="Link"
          />
          <input
            class="input"
            bind:value={item.contact}
            placeholder="Kontakt"
            aria-label="Kontakt"
          />
          <label class="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              class="size-4 accent-(--accent)"
              checked={item.sharesBackline === 1}
              onchange={(event) => (item.sharesBackline = event.currentTarget.checked ? 1 : 0)}
            />
            Teilt Backline mit uns
          </label>
        </div>
      {/snippet}
    </ListEditor>
    {#if errors.acts}<span class="text-sm text-danger">{errors.acts}</span>{/if}
  {/snippet}
</Section>

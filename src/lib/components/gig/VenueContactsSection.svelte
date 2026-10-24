<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import Fact from "$lib/components/Fact.svelte";
  import OutboundLink from "$lib/components/OutboundLink.svelte";
  import Section from "$lib/components/Section.svelte";
  import type { GigDetail } from "$lib/server/services/gigs";
  import { Building2, ExternalLink, Mail, MapPin, Phone, Plus, X } from "@lucide/svelte";

  let {
    gig,
    contacts,
    errors,
    editing = $bindable(false),
  }: {
    gig: GigDetail;
    contacts: { id: string; name: string; company: string }[];
    errors: Record<string, string>;
    editing?: boolean;
  } = $props();

  const roles = ["Veranstalter", "Booker", "Ansprechpartner vor Ort", "Technik", "Promoter"];
  const venue = $derived(gig.venue);
  const mapsUrl = $derived(
    venue
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [venue.name, venue.address, venue.city].filter(Boolean).join(", "),
        )}`
      : "",
  );
  const linkedIds = $derived(new Set(gig.contacts.map((link) => link.contactId)));
</script>

{#snippet contactList(removable: boolean)}
  {#each gig.contacts as link (link.contactId)}
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <a
            href={resolve("/contacts/[id]", { id: link.contactId })}
            class="font-medium hover:text-accent">{link.contact.name}</a
          >
          {#if link.role}<span class="chip">{link.role}</span>{/if}
        </div>
        <div class="mt-0.5 flex flex-wrap gap-x-4 text-muted">
          {#if link.contact.phone}
            <a href="tel:{link.contact.phone}" class="flex items-center gap-1 hover:text-accent"
              ><Phone class="size-3.5" />{link.contact.phone}</a
            >
          {/if}
          {#if link.contact.email}
            <a href="mailto:{link.contact.email}" class="flex items-center gap-1 hover:text-accent"
              ><Mail class="size-3.5" />{link.contact.email}</a
            >
          {/if}
        </div>
      </div>
      {#if removable}
        <form method="POST" action="?/unlinkContact" use:enhance>
          <input type="hidden" name="contactId" value={link.contactId} />
          <button type="submit" class="btn-icon hover:text-danger" aria-label="Kontakt entfernen"
            ><X class="size-4" /></button
          >
        </form>
      {/if}
    </div>
  {/each}
{/snippet}

<Section id="venue" title="Venue & Kontakte" icon={Building2} bind:editing>
  {#snippet summary()}
    <div class="flex flex-col gap-4">
      {#if venue}
        <div>
          <a href={resolve("/venues/[id]", { id: venue.id })} class="font-medium hover:text-accent"
            >{venue.name}</a
          >
          {#if venue.address || venue.city}
            <OutboundLink
              href={mapsUrl}
              class="flex items-center gap-1 text-sm text-muted hover:text-accent"
            >
              <MapPin class="size-3.5" />{[venue.address, venue.city].filter(Boolean).join(", ")}
            </OutboundLink>
          {:else}
            <a
              href={resolve("/venues/[id]", { id: venue.id })}
              class="text-xs text-accent hover:underline">Adresse ergänzen</a
            >
          {/if}
        </div>
        {#if venue.capacity || venue.stage || venue.loadIn || venue.website}
          <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            {#if venue.capacity}<Fact label="Kapazität">{venue.capacity}</Fact>{/if}
            {#if venue.stage}<Fact label="Bühne">{venue.stage}</Fact>{/if}
            {#if venue.website}
              <Fact label="Website">
                <OutboundLink
                  href={venue.website}
                  class="inline-flex items-center gap-1 text-accent hover:underline"
                  >Öffnen<ExternalLink class="size-3" /></OutboundLink
                >
              </Fact>
            {/if}
            {#if venue.loadIn}<Fact label="Ladezone / Parken" wide>{venue.loadIn}</Fact>{/if}
          </dl>
        {/if}
      {/if}
      {#if gig.contacts.length > 0}
        <div class={["flex flex-col gap-3", venue && "border-t border-border pt-4"]}>
          {@render contactList(false)}
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet form()}
    <div class="flex flex-col gap-3">
      {@render contactList(true)}
      <form
        method="POST"
        action="?/linkContact"
        use:enhance
        class="flex flex-col gap-2 sm:flex-row"
      >
        <select name="contactId" class="input sm:flex-1" aria-label="Kontakt">
          <option value="">Kontakt wählen …</option>
          {#each contacts.filter((contact) => !linkedIds.has(contact.id)) as contact (contact.id)}
            <option value={contact.id}
              >{contact.name}{contact.company ? ` (${contact.company})` : ""}</option
            >
          {/each}
        </select>
        <input
          name="role"
          list="contact-roles"
          class="input sm:w-56"
          placeholder="Rolle"
          aria-label="Rolle"
        />
        <datalist id="contact-roles">
          {#each roles as role (role)}<option value={role}></option>{/each}
        </datalist>
        <button type="submit" class="btn btn-ghost"><Plus class="size-4" /> Verknüpfen</button>
      </form>
      {#if errors.contactId}<span class="text-sm text-danger">{errors.contactId}</span>{/if}
      <p class="text-xs text-muted">
        Neuer Kontakt? <a href={resolve("/contacts")} class="text-accent hover:underline"
          >Im Adressbuch anlegen</a
        >
        {#if venue}
          · <a href={resolve("/venues/[id]", { id: venue.id })} class="text-accent hover:underline"
            >Venue bearbeiten</a
          >{/if}
      </p>
    </div>
  {/snippet}
</Section>

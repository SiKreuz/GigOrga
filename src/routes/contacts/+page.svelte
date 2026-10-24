<script lang="ts">
  import { enhance } from "$app/forms";
  import { allowed } from "$lib/access.svelte";
  import ContactFields from "$lib/components/ContactFields.svelte";
  import { ChevronRight, Mail, Phone, Plus } from "@lucide/svelte";

  let { data, form } = $props();
  let creating = $state(false);
</script>

<svelte:head>
  <title>Kontakte · GigOrga</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight">Kontakte</h1>
    {#if !creating && !form && allowed("edit")}
      <button class="btn btn-primary" onclick={() => (creating = true)}
        ><Plus class="size-4" /> Neuer Kontakt</button
      >
    {/if}
  </div>

  {#if creating || form}
    <form method="POST" use:enhance class="flex flex-col gap-4 card p-5 sm:p-6">
      <h2 class="font-semibold">Neuer Kontakt</h2>
      <ContactFields values={form?.values} errors={form?.errors} />
      <div class="flex justify-end gap-2">
        <a href="/contacts" class="btn btn-ghost" onclick={() => (creating = false)}>Abbrechen</a>
        <button class="btn btn-primary">Anlegen</button>
      </div>
    </form>
  {/if}

  {#if data.contacts.length > 0}
    <div class="divide-y divide-border overflow-hidden card">
      {#each data.contacts as contact (contact.id)}
        <div class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
          >
            {contact.name.slice(0, 1).toUpperCase()}
          </span>
          <a href="/contacts/{contact.id}" class="min-w-0 flex-1">
            <div class="font-medium">{contact.name}</div>
            {#if contact.company}<div class="text-sm text-muted">{contact.company}</div>{/if}
          </a>
          {#if contact.phone}
            <a
              href="tel:{contact.phone}"
              class="btn-icon"
              aria-label="Anrufen"
              title={contact.phone}><Phone class="size-4" /></a
            >
          {/if}
          {#if contact.email}
            <a
              href="mailto:{contact.email}"
              class="btn-icon"
              aria-label="E-Mail"
              title={contact.email}><Mail class="size-4" /></a
            >
          {/if}
          <a href="/contacts/{contact.id}" class="btn-icon" aria-label="Bearbeiten"
            ><ChevronRight class="size-4" /></a
          >
        </div>
      {/each}
    </div>
  {:else if !creating}
    <p class="text-sm text-muted">Noch keine Kontakte angelegt.</p>
  {/if}
</div>

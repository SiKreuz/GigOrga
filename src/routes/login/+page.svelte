<script lang="ts">
  import { page } from "$app/state";
  import { AudioLines, KeyRound } from "@lucide/svelte";

  let { data } = $props();

  const action = $derived(`?/login${page.url.search.replace("?", "&")}`);
</script>

<svelte:head>
  <title>Anmelden · GigOrga</title>
</svelte:head>

<div class="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
  <span
    class="mb-6 flex size-12 items-center justify-center rounded-xl bg-accent text-accent-contrast"
  >
    <AudioLines class="size-6" />
  </span>
  <h1 class="text-xl font-semibold tracking-tight">Willkommen bei GigOrga</h1>
  <p class="mt-2 text-sm text-muted">Melde dich mit deinem twiceasmad-Konto an.</p>
  {#if data.failed}
    <p class="mt-4 text-sm text-danger">
      Anmeldung fehlgeschlagen. Bist du für GigOrga freigeschaltet?
    </p>
  {/if}
  <form method="POST" {action} class="mt-8 w-full">
    <button class="btn w-full btn-primary">
      <KeyRound class="size-4" />
      Mit Pocket ID anmelden
    </button>
  </form>
</div>

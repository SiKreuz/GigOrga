<script lang="ts">
  import { enhance } from "$app/forms";
  import ConfirmButton from "$lib/components/ConfirmButton.svelte";
  import { keys, roles } from "$lib/labels";
  import { ExternalLink, Trash2 } from "@lucide/svelte";

  let { data, form } = $props();

  const lastLogin = (date: Date) =>
    date.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });
</script>

<svelte:head>
  <title>Benutzer · GigOrga</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight">Benutzer</h1>
    {#if data.identityProvider}
      <a href={data.identityProvider} class="btn btn-ghost" target="_blank" rel="noreferrer"
        ><ExternalLink class="size-4" /> In Pocket ID einladen</a
      >
    {/if}
  </div>
  <p class="text-sm text-muted">
    Neue Mitglieder lädst du in Pocket ID ein. Nach ihrer ersten Anmeldung erscheinen sie hier mit
    Leserechten.
  </p>
  {#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}

  <div class="divide-y divide-border overflow-hidden card">
    {#each data.users as user (user.id)}
      {@const self = user.id === data.user?.id}
      <div class="flex flex-wrap items-center gap-4 px-5 py-3.5">
        <div class="min-w-0 flex-1">
          <div class={["truncate font-medium", user.active === 0 && "text-muted line-through"]}>
            {user.name || user.email}{self ? " (du)" : ""}
          </div>
          <div class="truncate text-xs text-muted">
            {user.email} · zuletzt angemeldet {lastLogin(user.lastLoginAt)}
          </div>
        </div>
        {#if self}
          <span class="chip">{roles[user.role]}</span>
        {:else}
          <form method="POST" action="?/change" use:enhance class="flex items-center gap-2">
            <input type="hidden" name="id" value={user.id} />
            <select
              name="role"
              class="h-9 input w-36"
              aria-label="Rolle"
              value={user.role}
              onchange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              {#each keys(roles) as role (role)}
                <option value={role}>{roles[role]}</option>
              {/each}
            </select>
          </form>
          <form method="POST" action="?/change" use:enhance>
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="active" value={user.active === 0 ? "1" : "0"} />
            <button class="btn h-9 btn-ghost px-3">
              {user.active === 0 ? "Aktivieren" : "Sperren"}
            </button>
          </form>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="id" value={user.id} />
            <ConfirmButton
              message={`${user.name || user.email} aus GigOrga entfernen? Solange das Konto in Pocket ID freigeschaltet ist, kann es sich wieder anmelden. Zum Aussperren „Sperren“ nutzen.`}
              label="Entfernen"
            >
              <Trash2 class="size-4" />
            </ConfirmButton>
          </form>
        {/if}
      </div>
    {/each}
  </div>
</div>

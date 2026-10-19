<script lang="ts">
  import { enhance } from "$app/forms";
  import { allowed } from "$lib/access.svelte";
  import { LoaderCircle } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  let {
    action,
    children,
    extra,
    label = "Speichern",
    onsaved,
    oncancel,
  }: {
    action: string;
    children: Snippet;
    extra?: Snippet;
    label?: string;
    onsaved?: () => void;
    oncancel?: () => void;
  } = $props();

  let state = $state<"idle" | "saving" | "saved" | "error">("idle");
  let timer: ReturnType<typeof setTimeout> | undefined;
</script>

<form
  method="POST"
  {action}
  class="flex flex-col gap-5"
  use:enhance={() => {
    state = "saving";
    clearTimeout(timer);
    return async ({ result, update }) => {
      await update({ reset: false });
      state = result.type === "success" ? "saved" : "error";
      if (result.type === "success") onsaved?.();
      timer = setTimeout(() => (state = "idle"), 2500);
    };
  }}
>
  <fieldset disabled={!allowed("edit")} class="contents">
    {@render children()}
  </fieldset>
  {#if allowed("edit")}
    <div class="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
      {#if state === "saved" && !onsaved}
        <span class="text-sm text-success">Gespeichert</span>
      {:else if state === "error"}
        <span class="text-sm text-danger">Bitte Eingaben prüfen</span>
      {/if}
      {#if extra}
        {@render extra()}
      {/if}
      {#if oncancel}
        <button type="button" class="btn btn-ghost" onclick={oncancel}>Abbrechen</button>
      {/if}
      <button type="submit" class="btn btn-primary" disabled={state === "saving"}>
        {#if state === "saving"}
          <LoaderCircle class="size-4 animate-spin" />
        {/if}
        {label}
      </button>
    </div>
  {/if}
</form>

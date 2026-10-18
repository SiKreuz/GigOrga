<script lang="ts">
  import { Check, Pencil } from "@lucide/svelte";
  import type { Component, Snippet } from "svelte";

  import SectionForm from "./SectionForm.svelte";

  let {
    id,
    title,
    icon: Icon,
    action,
    editing = $bindable(false),
    summary,
    form,
    formExtra,
  }: {
    id: string;
    title: string;
    icon: Component<{ class?: string }>;
    action?: string;
    editing?: boolean;
    summary: Snippet;
    form: Snippet;
    formExtra?: Snippet;
  } = $props();

  let saved = $state(false);

  function onsaved() {
    editing = false;
    saved = true;
    setTimeout(() => (saved = false), 2500);
  }
</script>

<section {id} class="scroll-mt-24 card">
  <div class={["flex items-center gap-3 px-5 py-4 sm:px-6", editing && "border-b border-border"]}>
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
    >
      <Icon class="size-4" />
    </span>
    <h2 class="min-w-0 flex-1 font-semibold tracking-tight">{title}</h2>
    {#if saved && !editing}
      <span class="flex items-center gap-1 text-sm text-success">
        <Check class="size-4" /> Gespeichert
      </span>
    {/if}
    {#if !editing}
      <button type="button" class="btn h-8 btn-ghost px-3" onclick={() => (editing = true)}>
        <Pencil class="size-3.5" />
        <span class="hidden sm:inline">Bearbeiten</span>
      </button>
    {/if}
  </div>
  {#if editing}
    <div class="p-5 sm:p-6">
      {#if action}
        <SectionForm {action} extra={formExtra} {onsaved} oncancel={() => (editing = false)}>
          {@render form()}
        </SectionForm>
      {:else}
        <div class="flex flex-col gap-5">
          {@render form()}
          <div class="flex justify-end border-t border-border pt-4">
            <button type="button" class="btn btn-primary" onclick={() => (editing = false)}>
              Fertig
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="px-5 pb-5 sm:px-6">
      {@render summary()}
    </div>
  {/if}
</section>

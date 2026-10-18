<script lang="ts">
  import { page } from "$app/state";
  import EmptyState from "$lib/components/EmptyState.svelte";
</script>

<EmptyState
  title={page.status === 404 ? "Nicht gefunden" : "Da ist etwas schiefgelaufen"}
  description={page.error?.message}
>
  <a href="/" class="btn btn-ghost">Zurück zur Übersicht</a>
</EmptyState>

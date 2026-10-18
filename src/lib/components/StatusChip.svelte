<script lang="ts">
  import { type GigStatus, gigStatuses } from "$lib/labels";

  let { status }: { status: GigStatus } = $props();

  const styles: Record<GigStatus, string> = {
    anfrage: "bg-surface-2 text-muted",
    option: "bg-warning-soft text-warning",
    bestaetigt: "bg-accent-soft text-accent",
    vertrag: "bg-success-soft text-success",
    gespielt: "bg-surface-2 text-text",
    abgesagt: "bg-surface-2 text-danger line-through",
  };
</script>

<span
  class={[
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
    styles[status],
  ]}
>
  {gigStatuses[status]}
</span>

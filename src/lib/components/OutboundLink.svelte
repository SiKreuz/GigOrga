<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  let { children, ...attributes }: HTMLAnchorAttributes = $props();
</script>

<a {...attributes} target="_blank" rel="external noopener noreferrer">{@render children?.()}</a>

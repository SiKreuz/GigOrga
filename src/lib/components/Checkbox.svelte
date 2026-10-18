<script lang="ts">
  let {
    name,
    label,
    checked = false,
  }: { name: string; label: string; checked?: boolean } = $props();
</script>

<label class="flex cursor-pointer items-center gap-2.5 text-sm select-none">
  <input type="checkbox" {name} {checked} class="size-4 rounded accent-(--accent)" />
  {label}
</label>

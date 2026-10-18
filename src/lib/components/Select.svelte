<script lang="ts">
  let {
    id,
    name = id,
    options,
    value = $bindable(),
  }: { id: string; name?: string; options: Record<string, string>; value?: string } = $props();
</script>

<select {id} {name} class="input" bind:value>
  {#each Object.entries(options) as [key, text] (key)}
    <option value={key}>{text}</option>
  {/each}
</select>

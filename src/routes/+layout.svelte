<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/Header.svelte";

  let { data, children } = $props();
</script>

<svelte:head>
  <title>GigOrga</title>
</svelte:head>

<Header user={data.user} />

<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:p-0">
  {@render children()}
</main>

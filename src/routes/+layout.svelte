<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/Header.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>GigOrga</title>
</svelte:head>

<Header />

<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
  {@render children()}
</main>

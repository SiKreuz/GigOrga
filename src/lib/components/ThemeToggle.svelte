<script lang="ts">
  import { Moon, Sun } from "@lucide/svelte";

  function isDark() {
    const stored = document.documentElement.dataset.theme;
    if (stored) return stored === "dark";
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function toggle() {
    const theme = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }
</script>

<button
  type="button"
  class="btn w-10 btn-ghost px-0"
  onclick={toggle}
  aria-label="Hell/Dunkel umschalten"
  title="Hell/Dunkel umschalten"
>
  <Moon class="size-4 dark:hidden" />
  <Sun class="hidden size-4 dark:block" />
</button>

<script lang="ts">
  import { page } from "$app/state";
  import { allowed } from "$lib/access.svelte";
  import {
    AudioLines,
    Building2,
    CalendarDays,
    LogOut,
    Music,
    Plus,
    Route,
    Settings,
    UserCog,
    Users,
  } from "@lucide/svelte";

  import ThemeToggle from "./ThemeToggle.svelte";

  let { user }: { user: { name: string; email: string } | null } = $props();

  const links = [
    { href: "/", label: "Gigs", icon: CalendarDays },
    { href: "/tours", label: "Touren", icon: Route },
    { href: "/venues", label: "Venues", icon: Building2 },
    { href: "/contacts", label: "Kontakte", icon: Users },
    { href: "/songs", label: "Songs", icon: Music },
    { href: "/settings", label: "Einstellungen", icon: Settings },
  ];
  const adminLinks = [{ href: "/benutzer", label: "Benutzer", icon: UserCog }];

  const active = (href: string) =>
    href === "/"
      ? page.url.pathname === "/" || page.url.pathname.startsWith("/gigs")
      : page.url.pathname.startsWith(href);
</script>

<header
  class="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md print:hidden"
>
  <div class="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
    <a href="/" class="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
      <span
        class="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-contrast"
      >
        <AudioLines class="size-4.5" />
      </span>
      <span class="hidden md:inline">GigOrga</span>
    </a>
    {#if user}
      <nav class="flex min-w-0 items-center gap-1">
        {#each allowed("manageUsers") ? [...links, ...adminLinks] : links as link (link.href)}
          {@const Icon = link.icon}
          <a
            href={link.href}
            class={[
              "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors sm:px-3",
              active(link.href)
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text",
            ]}
            aria-label={link.label}
            aria-current={active(link.href) ? "page" : undefined}
          >
            <Icon class="size-4" />
            <span class="hidden lg:inline">{link.label}</span>
          </a>
        {/each}
      </nav>
    {/if}
    <div class="ml-auto flex shrink-0 items-center gap-2">
      {#if user && allowed("edit")}
        <a
          href="/gigs/new"
          class="btn w-10 btn-primary px-0 sm:w-auto sm:px-4"
          aria-label="Neuer Gig"
        >
          <Plus class="size-4" />
          <span class="hidden sm:inline">Neuer Gig</span>
        </a>
      {/if}
      <ThemeToggle />
      {#if user}
        <form method="POST" action="/login?/logout">
          <button
            class="btn w-10 btn-ghost px-0"
            aria-label="Abmelden"
            title={`Abmelden (${user.name || user.email})`}
          >
            <LogOut class="size-4" />
          </button>
        </form>
      {/if}
    </div>
  </div>
</header>

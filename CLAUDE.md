# GigOrga

Gig planner for the band twiceasmad. Each gig holds everything around it: venue, contacts, timetable (with fixed times such as get-in), support acts, tech/backline, deal & tickets with a live income estimate, travel cost (route via Nominatim + OSRM, also across tours of several gigs), hospitality and accommodation. Band members log in through Pocket ID (OIDC, deployed separately); Pocket ID decides who may use the app at all.

The UI is German (hardcoded strings, labels in `src/lib/labels.ts`). Code, identifiers and commits are English.

## Stack

- Bun for everything: package manager and runtime (dev, tests, production). Never use npm, npx, yarn, pnpm or node.
- Vite+ (`vp`) as the toolchain: Vite for dev/build, Vitest for tests, Oxlint for linting (correctness + pedantic, type-aware), Oxfmt for formatting. Config lives in `vite.config.ts`.
- SvelteKit 2 + Svelte 5 (runes) + TypeScript 7 (`@typescript/native`; TypeScript 6 stays installed for the Svelte tooling), `svelte-adapter-bun`.
- SQLite via Prisma 8 (`@prisma/orm-sqlite`). The data contract and the single migration live in `prisma/`. The database lives under `DATA_DIR`.
- Tailwind CSS v4.
- All dependencies are pinned to exact versions (`bunfig.toml` sets `exact = true`).

## Commands

There are no `package.json` scripts; tasks live in `vite.config.ts` under `run.tasks` and run with `bunx vp run <task>` (or `vpr <task>` with the global Vite+ CLI).

- `bun install`: install dependencies
- `bunx vp run dev`: apply migrations, then start the dev server (Vite on Bun)
- `bunx vp run test`: unit tests (Vitest on Bun)
- `bunx vp run check`: format check, lint and type check (`vp check` + `svelte-check --tsgo`)
- `bunx vp run fix`: apply formatting and lint autofixes
- `bunx vp run build`: production build
- `bunx vp run start`: build and run the production server
- `bunx vp run migrate`: apply database migrations

## Working rules

- Keep it simple. Build only what is asked, no speculative features or abstractions. Iterate later.
- Tests first: write unit tests for a module, see them fail, then implement until they pass. Focus on unit tests (services, deal math, forms, routing with a mocked fetch), not UI or E2E tests.
- Tests live next to the module under test (`foo.ts` → `foo.test.ts`) and import from `vitest`.
- Avoid comments unless absolutely necessary. Prefer clear names.
- 2-space indentation everywhere (Oxfmt + `.editorconfig`).
- Run `bunx vp run test` and `bunx vp run check` before every commit; both must pass.
- Commit per feature in small, logical steps, in a useful order. Never one big commit.
- Conventional commit messages: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`, `build:`, `style:`.

## Architecture

- Server-only code lives in `src/lib/server/`. Routes stay thin: `load` and form actions call services in `src/lib/server/services/`.
- Mutations use SvelteKit form actions with Valibot validation and `use:enhance`. `+server.ts` is only for non-form endpoints (`/healthz`, `/auth/callback`).
- Auth: `hooks.server.ts` validates the session cookie and sets `locals.user`; every route except `/login`, `/auth/callback` and `/healthz` requires a session. Sessions live in SQLite and store only the SHA-256 hash of the token. The OIDC flow (`openid-client`) is wrapped in `src/lib/server/oidc.ts`.
- `compose.dev.yml` runs a local Pocket ID for development only; production infra is not part of this repo.
- Database:
  - Every connection sets these pragmas: `journal_mode=WAL`, `synchronous=NORMAL`, `foreign_keys=ON`, `busy_timeout=5000`.
  - Use a single connection.
  - Schema changes go through the Prisma 8 contract and planned, committed migrations. The Prisma 8 docs ship in `node_modules/@prisma/orm-sqlite/skills/prisma-8/`; read them instead of relying on memory.
  - IDs are UUIDv7.
    - SQLite PSL has no `Boolean`: flags are `Int` (0/1). Enum columns come back as `string`; services cast them to the label types.
  - Multi-row deletes need `deleteAll()`; `delete()` removes a single row.
- List sections (timetable, support acts, backline, presale links) post as one JSON hidden field and are replaced wholesale by the service.
- Money is stored as euros (`Float`). Number inputs accept a German decimal comma.
- Travel cost: per selected car with its own consumption and fuel type (diesel or petrol); people and both fuel prices fall back to the settings when a gig leaves them empty.
- Tours group gigs, ordered by date. A gig without a tour is a round trip from home. On a tour each gig arrives from the previous stop (the first from home) and only the last stop adds the drive home (`returnKm`).
- The gig page shows each section as a read-only summary; "Bearbeiten" swaps in the form. Optional sections that are still empty appear only as "Hinzufügen" chips.

## UI

- Clean, modern and minimal. Show only what is essential.
- Light and dark mode: follow `prefers-color-scheme`, with a manual toggle.
- The accent is the twiceasmad brand purple (#933D83 ≈ `oklch(0.5 0.144 335)`, deep #5A1F52; neutrals carry a faint tint of the same hue). Define colors as design tokens in `src/app.css` and don't hard-code colors in components.

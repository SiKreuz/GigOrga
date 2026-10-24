import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const generated = [
  { auto: true },
  "!.svelte-kit/**",
  "!.svelte-kit",
  "!build/**",
  "!build",
  "!node_modules/.vite/**",
];

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  run: {
    tasks: {
      dev: { command: "bun --bun vp dev", cache: false, dependsOn: ["migrate"] },
      build: { command: "bun --bun vp build", cache: { input: generated } },
      start: { command: "bun ./build/index.js", cache: false, dependsOn: ["build"] },
      test: { command: "bun --bun vp test run", cache: { input: generated } },
      check: {
        command: "svelte-kit sync && vp check && svelte-check --tsgo --tsconfig ./tsconfig.json",
        cache: { input: generated },
      },
      fix: { command: "vp check --fix", cache: false },
      migrate: { command: "bunx --bun prisma db migrate", cache: false },
    },
  },
  fmt: {
    printWidth: 100,
    sortImports: true,
    sortTailwindcss: { stylesheet: "./src/app.css" },
    svelte: true,
    ignorePatterns: [
      "build/**",
      ".svelte-kit/**",
      ".claude/skills/prisma-8/**",
      "prisma/contract.*",
      "prisma/migrations/**",
    ],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "import", "vitest"],
    categories: {
      correctness: "error",
      pedantic: "error",
    },
    rules: {
      "typescript/prefer-readonly-parameter-types": "off",
    },
    overrides: [
      {
        files: ["**/*.test.ts"],
        rules: {
          "eslint/max-lines-per-function": "off",
          "vitest/no-standalone-expect": [
            "error",
            { additionalTestBlockFunctions: ["test", "test.for"] },
          ],
        },
      },
      {
        files: ["src/lib/server/testing.ts"],
        rules: { "import/max-dependencies": "off" },
      },
      {
        files: ["**/*.svelte", "src/routes/**/+page.server.ts"],
        rules: { "import/max-dependencies": ["error", { max: 20 }] },
      },
    ],
    ignorePatterns: [
      "build/**",
      ".svelte-kit/**",
      ".claude/skills/prisma-8/**",
      "prisma/contract.*",
      "prisma/migrations/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      reportUnusedDisableDirectives: "error",
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
